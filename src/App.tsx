import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Adjustments, defaultAdjustments, EditorState, ImageRecord, Preset, HistogramData } from './types';
import { TopBar } from './components/TopBar';
import { RightSidebar } from './components/RightSidebar';
import { LeftSidebar } from './components/LeftSidebar';
import { MobileControls } from './components/MobileControls';
import { PhotoCanvas } from './components/PhotoCanvas';
import { Filmstrip } from './components/Filmstrip';
import { ExportModal } from './components/ExportModal';
import { applyAdjustments, applySharpen } from './lib/imageProcessor';
import { Upload } from 'lucide-react';
import { cn } from './lib/utils';
import { useWindowSize } from 'react-use';

export default function App() {
  const [state, setState] = useState<EditorState>({
    images: [],
    currentIndex: -1,
    viewMode: 'editor',
    isBeforeView: false,
    presets: [
      { id: 'p1', name: 'Vintage Warm', isBuiltIn: true, adjustments: { ...defaultAdjustments, temperature: 20, tint: 10, contrast: -10, exposure: 0.2, saturation: -15, vibrance: 10 } },
      { id: 'p2', name: 'Cool Mint', isBuiltIn: true, adjustments: { ...defaultAdjustments, temperature: -25, tint: 5, contrast: 15, highlights: -10, shadows: 20 } },
      { id: 'p3', name: 'High Contrast B&W', isBuiltIn: true, adjustments: { ...defaultAdjustments, contrast: 50, saturation: -100, clarity: 30, highlights: 20, shadows: -20, blacks: -10 } },
    ],
    activePresetId: null,
    copiedSettings: null
  });

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mobileAdjustOpen, setMobileAdjustOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [histogramData, setHistogramData] = useState<HistogramData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const currentImg = state.images[state.currentIndex];
  const adjustments = currentImg ? currentImg.adjustments : defaultAdjustments;
  const historyIndex = currentImg ? currentImg.historyIndex : 0;

  const processFiles = (files: FileList | File[]) => {
    const newImages: ImageRecord[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          adjustments: { ...defaultAdjustments },
          history: [{ ...defaultAdjustments }],
          historyIndex: 0
        });
      }
    }
    
    if (newImages.length > 0) {
      setState(s => ({
        ...s,
        images: [...s.images, ...newImages],
        currentIndex: s.currentIndex === -1 ? 0 : s.currentIndex,
        viewMode: 'editor'
      }));
      setScale(1);
      setPan({ x: 0, y: 0 });
      if (isMobile) setMobileAdjustOpen(true);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const updateCurrentSettings = (recipe: (img: ImageRecord) => ImageRecord) => {
    setState(s => {
      if (s.currentIndex === -1) return s;
      const images = [...s.images];
      images[s.currentIndex] = recipe(images[s.currentIndex]);
      return { ...s, images, activePresetId: null };
    });
  };

  const updateAdjustment = (key: keyof Adjustments, val: number) => {
    updateCurrentSettings(img => ({
      ...img,
      adjustments: { ...img.adjustments, [key]: val }
    }));
  };

  useEffect(() => {
    const onMouseUp = () => {
      setState(s => {
        if (s.currentIndex === -1) return s;
        const img = s.images[s.currentIndex];
        const lastHist = img.history[img.historyIndex];
        
        if (JSON.stringify(img.adjustments) !== JSON.stringify(lastHist)) {
          const newHistory = img.history.slice(0, img.historyIndex + 1);
          newHistory.push({ ...img.adjustments });
          
          const images = [...s.images];
          images[s.currentIndex] = { ...img, history: newHistory, historyIndex: newHistory.length - 1 };
          return { ...s, images };
        }
        return s;
      });
    };
    window.addEventListener('pointerup', onMouseUp);
    return () => window.removeEventListener('pointerup', onMouseUp);
  }, []);

  const handleUndo = () => {
    updateCurrentSettings(img => {
      if (img.historyIndex > 0) {
        const newIdx = img.historyIndex - 1;
        return { ...img, historyIndex: newIdx, adjustments: { ...img.history[newIdx] } };
      }
      return img;
    });
  };

  const handleRedo = () => {
    updateCurrentSettings(img => {
      if (img.historyIndex < img.history.length - 1) {
        const newIdx = img.historyIndex + 1;
        return { ...img, historyIndex: newIdx, adjustments: { ...img.history[newIdx] } };
      }
      return img;
    });
  };

  const commitSettings = (newAdj: Adjustments, presetId: string | null = null) => {
    setState(s => {
      if (s.currentIndex === -1) return s;
      const img = s.images[s.currentIndex];
      const newHistory = img.history.slice(0, img.historyIndex + 1);
      newHistory.push({ ...newAdj });
      const images = [...s.images];
      images[s.currentIndex] = {
        ...img,
        adjustments: { ...newAdj },
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
      return { ...s, images, activePresetId: presetId };
    });
  };

  const resetAll = () => {
    commitSettings(defaultAdjustments, null);
  };

  const applyPreset = (p: Preset) => {
    commitSettings(p.adjustments, p.id);
  };

  const handleCopySettings = () => {
    if (!currentImg) return;
    setState(s => ({ ...s, copiedSettings: { ...currentImg.adjustments } }));
  };

  const handlePasteSettings = () => {
    if (!state.copiedSettings) return;
    commitSettings(state.copiedSettings, null);
  };

  const savePreset = (name: string) => {
    if (!currentImg) return;
    const newPreset: Preset = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      adjustments: { ...currentImg.adjustments }
    };
    setState(s => ({ ...s, presets: [newPreset, ...s.presets], activePresetId: newPreset.id }));
  };

  const deletePreset = (id: string) => {
    setState(s => ({ ...s, presets: s.presets.filter((p: Preset) => p.id !== id) }));
  };

  const processExport = async (quality: number, selectedIds: string[]) => {
     setExportModalOpen(false);
     setIsExporting(true);
     
     const targets = state.images.filter(img => selectedIds.includes(img.id));
     
     try {
       for (const imgRec of targets) {
         const img = new Image();
         img.src = imgRec.url;
         await new Promise(res => { img.onload = res; });
         
         const canvas = document.createElement('canvas');
         canvas.width = img.width;
         canvas.height = img.height;
         const ctx = canvas.getContext('2d')!;
         ctx.drawImage(img, 0, 0);
         
         let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
         applyAdjustments(imgData.data, imgData.data, canvas.width, canvas.height, imgRec.adjustments);
         applySharpen(imgData.data, canvas.width, canvas.height, imgRec.adjustments.sharpness, imgRec.adjustments.clarity);
         ctx.putImageData(imgData, 0, 0);
         
         await new Promise<void>(resolve => {
            canvas.toBlob((blob) => {
               if(blob) {
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `DR_${imgRec.name}`;
                 a.click();
                 URL.revokeObjectURL(url);
               }
               resolve();
            }, 'image/jpeg', quality / 100);
         });
         
         if (targets.length > 1) await new Promise(r => setTimeout(r, 300));
       }
     } catch(e) {
       console.error(e);
     } finally {
       setIsExporting(false);
     }
  };

  const handleRemoveImage = (idx: number) => {
    setState(s => {
      const newImages = [...s.images];
      URL.revokeObjectURL(newImages[idx].url);
      newImages.splice(idx, 1);
      
      let newIdx = s.currentIndex;
      if (newIdx >= newImages.length) newIdx = newImages.length - 1;
      
      return { ...s, images: newImages, currentIndex: newIdx };
    });
  };

  return (
    <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden flex flex-col font-sans text-neutral-200">
      <TopBar 
        onZoomIn={() => setScale(s => s * 1.25)}
        onZoomOut={() => setScale(s => s * 0.8)}
        onFit={() => { setScale(1); setPan({x: 0, y: 0}); }}
        canUndo={historyIndex > 0}
        canRedo={currentImg ? historyIndex < currentImg.history.length - 1 : false}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isBeforeView={state.isBeforeView}
        onToggleBefore={(b) => setState(s => ({ ...s, isBeforeView: b }))}
        onExport={() => currentImg && setExportModalOpen(true)}
        onImport={() => fileInputRef.current?.click()}
        onCopySettings={handleCopySettings}
        onPasteSettings={handlePasteSettings}
        canCopy={!!currentImg}
        canPaste={!!state.copiedSettings && !!currentImg}
      />

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImport} />

      <div 
        className="flex-1 flex overflow-hidden relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <LeftSidebar presets={state.presets} onApplyPreset={applyPreset} onSavePreset={savePreset} onDeletePreset={deletePreset} activePresetId={state.activePresetId} />

        {!currentImg ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 m-8 rounded-2xl bg-[#111] hover:bg-[#141414] transition-colors cursor-pointer group"
               onClick={() => fileInputRef.current?.click()}>
             <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-neutral-800 duration-300 shadow-xl shadow-rose-900/10">
               <Upload className="w-8 h-8 text-rose-500" />
             </div>
             <h2 className="text-xl font-medium text-white mb-2">Import Images</h2>
             <p className="text-neutral-500 text-sm">Drag and drop, or click to browse</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex relative min-h-0">
              <div className={cn(
                "flex-1 relative bg-[#0a0a0a]",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              onWheel={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  setScale(s => Math.max(0.1, Math.min(10, s - e.deltaY * 0.01)));
                }
              }}
              onPointerDown={(e) => {
                if (e.target instanceof HTMLInputElement) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                dragStartPos.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
                setIsDragging(true);
              }}
              onPointerMove={(e) => {
                if (!isDragging) return;
                setPan({
                  x: dragStartPos.current.panX + (e.clientX - dragStartPos.current.x),
                  y: dragStartPos.current.panY + (e.clientY - dragStartPos.current.y)
                });
              }}
              onPointerUp={(e) => {
                setIsDragging(false);
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              onPointerCancel={(e) => {
                setIsDragging(false);
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              >
                <PhotoCanvas 
                  imageUrl={currentImg.url}
                  adjustments={adjustments}
                  isBeforeView={state.isBeforeView}
                  scale={scale}
                  pan={pan}
                  onHistogramUpdate={setHistogramData}
                />
                
                {isExporting && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4" />
                    <span className="text-white font-medium tracking-wider">Processing Export...</span>
                  </div>
                )}
              </div>
              
              {/* Desktop Sidebar */}
              <div className="hidden md:block">
                 <RightSidebar adjustments={adjustments} onChange={updateAdjustment} onReset={resetAll} histogramData={histogramData} />
              </div>
            </div>
            
            <Filmstrip images={state.images} activeIndex={state.currentIndex} onSelect={(idx) => setState(s => ({...s, currentIndex: idx}))} onRemove={handleRemoveImage} />
            
            {/* Mobile Controls */}
            <MobileControls 
                adjustments={adjustments} 
                onChange={updateAdjustment} 
                isOpen={mobileAdjustOpen}
                setIsOpen={setMobileAdjustOpen}
                presets={state.presets}
                onApplyPreset={applyPreset}
                activePresetId={state.activePresetId}
            />
          </div>
        )}
      </div>

      {exportModalOpen && (
        <ExportModal 
          onClose={() => setExportModalOpen(false)} 
          onExport={processExport} 
          images={state.images}
          currentImageId={currentImg?.id}
        />
      )}
    </div>
  );
}

