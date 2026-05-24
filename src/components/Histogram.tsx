import React, { useRef, useEffect } from 'react';
import { HistogramData } from '../types';

interface HistogramProps {
  data: HistogramData | null;
}

export function Histogram({ data }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!data) return;
    
    // Find max value to normalize the histogram height
    let max = 0;
    // Skip 0 and 255 to avoid huge peaks from pure black/white background
    for (let i = 1; i < 255; i++) {
       if (data.r[i] > max) max = data.r[i];
       if (data.g[i] > max) max = data.g[i];
       if (data.b[i] > max) max = data.b[i];
    }
    
    if (max === 0) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Use screen compositing so overlapping rgb colors create white/cyan/magenta/yellow
    ctx.globalCompositeOperation = 'screen';
    
    const drawChannel = (hist: Uint32Array, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        // Apply a slight curve to make smaller peaks more visible
        const normalized = Math.pow(hist[i] / max, 0.8);
        const y = h - Math.min(1, normalized) * h * 0.9; // 0.9 leaves top padding
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    };
    
    drawChannel(data.r, 'rgba(255, 60, 60, 0.8)');
    drawChannel(data.g, 'rgba(60, 255, 60, 0.8)');
    drawChannel(data.b, 'rgba(60, 60, 255, 0.8)');
    
  }, [data]);

  return (
    <div className="w-full h-32 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 shadow-inner p-2 mb-2">
      <canvas ref={canvasRef} width={256} height={100} className="w-full h-full" />
    </div>
  );
}
