import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Adjustments, HistogramData } from '../types';
import { applyAdjustments, applySharpen } from '../lib/imageProcessor';

interface PhotoCanvasProps {
  imageUrl: string;
  adjustments: Adjustments;
  isBeforeView: boolean;
  scale?: number;
  pan?: { x: number; y: number };
  onHistogramUpdate?: (data: HistogramData) => void;
}

// Global cache for preview image data to avoid re-decoding
const previewCache = new Map<string, {
    img: HTMLImageElement;
    origPixels: Uint8ClampedArray;
    width: number;
    height: number;
}>();

export function PhotoCanvas({ imageUrl, adjustments, isBeforeView, scale = 1, pan = { x: 0, y: 0 } }: PhotoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  
  const processFrameRef = useRef<number>();

  useEffect(() => {
    let active = true;
    const loadImg = async () => {
      if (previewCache.has(imageUrl)) {
        setLoaded(true);
        return;
      }
      
      const img = new Image();
      img.src = imageUrl;
      await new Promise(res => { img.onload = res; });
      if (!active) return;
      
      // Target max resolution for the "preview" canvas to stay fast (e.g. 1920x1080 bounding box)
      const MAX_DEV_SIZE = 1920;
      let w = img.width;
      let h = img.height;
      
      if (w > MAX_DEV_SIZE || h > MAX_DEV_SIZE) {
        const ratio = Math.min(MAX_DEV_SIZE / w, MAX_DEV_SIZE / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = w;
      tmpCanvas.height = h;
      const ctx = tmpCanvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, w, h);
      
      const origPixels = ctx.getImageData(0, 0, w, h).data;
      previewCache.set(imageUrl, { img, origPixels, width: w, height: h });
      setLoaded(true);
    };
    
    setLoaded(false);
    loadImg();
    return () => { active = false; };
  }, [imageUrl]);

  useEffect(() => {
    if (!loaded) return;
    if (processFrameRef.current) cancelAnimationFrame(processFrameRef.current);
    
    // We throttle adjustment processing to animation frames
    processFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const cached = previewCache.get(imageUrl);
      if (!canvas || !cached) return;
      const { origPixels, width, height } = cached;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.createImageData(width, height);
      
      if (isBeforeView) {
        imgData.data.set(origPixels);
      } else {
        applyAdjustments(origPixels, imgData.data, width, height, adjustments);
        applySharpen(imgData.data, width, height, adjustments.sharpness, adjustments.clarity);
      }
      
      ctx.putImageData(imgData, 0, 0);

      // Compute histogram if requested
      if (onHistogramUpdate) {
        const histR = new Uint32Array(256);
        const histG = new Uint32Array(256);
        const histB = new Uint32Array(256);
        const d = imgData.data;
        // Process every 4th pixel (step of 16 in RGBA array) for performance
        for (let i = 0; i < d.length; i += 16) {
          histR[d[i]]++;
          histG[d[i+1]]++;
          histB[d[i+2]]++;
        }
        onHistogramUpdate({ r: histR, g: histG, b: histB });
      }
    });
    
  }, [imageUrl, adjustments, loaded, isBeforeView]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out origin-center drop-shadow-2xl"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
        }}
      />
    </div>
  );
}
