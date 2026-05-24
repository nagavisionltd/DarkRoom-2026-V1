import React, { useState } from 'react';
import { Slider } from './Slider';
import { X, Download, CheckSquare, Square } from 'lucide-react';
import { ImageRecord } from '../types';
import { cn } from '../lib/utils';

interface ExportModalProps {
  onClose: () => void;
  onExport: (quality: number, selectedIds: string[]) => void;
  images: ImageRecord[];
  currentImageId?: string;
}

export function ExportModal({ onClose, onExport, images, currentImageId }: ExportModalProps) {
  const [quality, setQuality] = useState(90);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(currentImageId ? [currentImageId] : images.map(i => i.id))
  );

  const toggleImage = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(images.map(i => i.id)));
  const selectNone = () => setSelectedIds(new Set());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center shrink-0">
          <h2 className="text-white font-medium font-display tracking-wide">Export Images</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-sm text-neutral-300 font-medium">Select images for export</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-rose-500 hover:text-rose-400 font-medium">Select All</button>
                <button onClick={selectNone} className="text-xs text-neutral-500 hover:text-neutral-300 font-medium">Clear</button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map(img => {
                const isSelected = selectedIds.has(img.id);
                return (
                  <div 
                    key={img.id}
                    onClick={() => toggleImage(img.id)}
                    className={cn(
                      "group relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all",
                      isSelected ? "border-rose-500" : "border-transparent hover:border-neutral-700"
                    )}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className={cn(
                      "absolute inset-0 bg-black/40 transition-opacity",
                      isSelected ? "opacity-0" : "opacity-100 group-hover:opacity-50"
                    )} />
                    <div className="absolute top-1.5 left-1.5 bg-black/60 rounded text-white backdrop-blur-sm">
                      {isSelected ? <CheckSquare className="w-4 h-4 text-rose-500 bg-white/10 rounded" /> : <Square className="w-4 h-4 text-white/70" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
            <Slider 
              label="JPEG Quality" 
              min={10} max={100} 
              value={quality} 
              onChange={setQuality} 
              tooltip="Higher quality results in better image clarity but larger file sizes."
            />
          </div>
        </div>
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center shrink-0">
          <span className="text-sm text-neutral-500">{selectedIds.size} file{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white font-medium">Cancel</button>
            <button 
              onClick={() => onExport(quality, Array.from(selectedIds))} 
              disabled={selectedIds.size === 0}
              className={cn(
                "px-4 py-2 text-sm text-white font-medium rounded-md shadow-lg flex items-center gap-2 transition-all",
                selectedIds.size > 0 
                  ? "bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-90 shadow-rose-900/20" 
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none"
              )}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
