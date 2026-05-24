import React from 'react';
import { ImageRecord } from '../types';
import { X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface FilmstripProps {
  images: ImageRecord[];
  activeIndex: number;
  onSelect: (idx: number) => void;
  onRemove: (idx: number) => void;
}

export function Filmstrip({ images, activeIndex, onSelect, onRemove }: FilmstripProps) {
  if (images.length === 0) return null;
  
  return (
    <div className="h-20 md:h-24 bg-[#141414] border-t border-neutral-800 flex items-center px-4 overflow-x-auto custom-scrollbar gap-3 shrink-0 z-10 w-full relative">
      <div className="text-neutral-500 flex flex-col items-center justify-center h-full mr-2 hidden md:flex">
        <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Gallery</span>
      </div>
      
      {images.map((img, i) => (
        <div 
          key={img.id} 
          className={cn(
            "group relative h-14 w-14 md:h-16 md:w-16 rounded-md overflow-hidden shrink-0 border-2 cursor-pointer transition-all",
            i === activeIndex 
              ? "border-rose-500 scale-105 shadow-lg shadow-rose-900/40 opacity-100 z-10" 
              : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-600 z-0"
          )} 
          onClick={() => onSelect(i)}
        >
          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-all z-20"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
