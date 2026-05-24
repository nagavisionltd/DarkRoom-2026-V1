import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, SplitSquareHorizontal, Download, Upload, Copy, ClipboardPaste, Film } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isBeforeView: boolean;
  onToggleBefore: (b: boolean) => void;
  onExport: () => void;
  onImport: () => void;
  onCopySettings: () => void;
  onPasteSettings: () => void;
  canCopy: boolean;
  canPaste: boolean;
  currentCropRatio: string;
  onCropChange: (ratio: any) => void;
}

export function TopBar({ onZoomIn, onZoomOut, onFit, canUndo, canRedo, onUndo, onRedo, isBeforeView, onToggleBefore, onExport, onImport, onCopySettings, onPasteSettings, canCopy, canPaste, currentCropRatio, onCropChange }: TopBarProps) {
  
  const Btn = ({ onClick, icon, disabled, active, title, className }: any) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 sm:p-2 rounded-md transition-colors flex items-center justify-center shrink-0",
        disabled ? "text-neutral-600 cursor-not-allowed" : "text-neutral-300 hover:text-white hover:bg-neutral-800",
        active && "bg-neutral-800 text-rose-400",
        className
      )}
    >
      {icon}
    </button>
  );

  return (
    <div className="h-14 bg-[#141414] border-b border-neutral-800 flex items-center justify-between px-2 sm:px-4 shrink-0 transition-all z-20 overflow-x-auto custom-scrollbar scrollbar-none">
      
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2 md:mr-4 shrink-0 shrink-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/20 shrink-0 relative overflow-hidden group">
            <div className="absolute inset-y-[-24px] left-0 w-[6px] bg-[linear-gradient(rgba(0,0,0,0.6)_2px,rgba(0,0,0,0)_2px)] bg-[length:100%_8px] animate-film-slide border-r border-black/20" />
            <div className="absolute inset-y-[-24px] right-0 w-[6px] bg-[linear-gradient(rgba(0,0,0,0.6)_2px,rgba(0,0,0,0)_2px)] bg-[length:100%_8px] animate-film-slide border-l border-black/20" />
            <Film className="w-4 h-4 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex-col justify-center hidden sm:flex">
             <span className="text-neutral-100 font-semibold text-sm font-display tracking-wide leading-tight">DarkRoom</span>
             <span className="text-neutral-400 font-display font-[300] text-[9px] tracking-[0.25em] uppercase leading-none mt-0.5">by NagaVision</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 bg-neutral-900 rounded-lg p-1 border border-neutral-800 shrink-0">
           <Btn icon={<Undo2 className="w-4 h-4" />} disabled={!canUndo} onClick={onUndo} title="Undo" />
           <Btn icon={<Redo2 className="w-4 h-4" />} disabled={!canRedo} onClick={onRedo} title="Redo" />
           <div className="w-px h-4 bg-neutral-800 mx-1 hidden sm:block" />
           <Btn icon={<Copy className="w-4 h-4" />} disabled={!canCopy} onClick={onCopySettings} title="Copy Settings" />
           <Btn icon={<ClipboardPaste className="w-4 h-4" />} disabled={!canPaste} onClick={onPasteSettings} title="Paste Settings" />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-4">
        <select
          value={currentCropRatio}
          onChange={(e) => onCropChange(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-600 custom-scrollbar shrink-0 mr-1 md:mr-2"
          disabled={!canCopy}
        >
          <option value="Original">Original</option>
          <option value="1:1">1:1 Square</option>
          <option value="4:3">4:3 Landscape</option>
          <option value="3:4">3:4 Portrait</option>
          <option value="16:9">16:9 Landscape</option>
          <option value="9:16">9:16 Portrait</option>
        </select>
        <div className="flex items-center gap-0.5 bg-neutral-900 rounded-lg p-1 border border-neutral-800 mr-1 md:mr-4">
           <Btn icon={<ZoomOut className="w-4 h-4" />} onClick={onZoomOut} title="Zoom Out" />
           <Btn icon={<Maximize className="w-4 h-4" />} onClick={onFit} title="Fit to Screen" />
           <Btn icon={<ZoomIn className="w-4 h-4" />} onClick={onZoomIn} title="Zoom In" />
        </div>

        <button 
          onPointerDown={() => onToggleBefore(true)}
          onPointerUp={() => onToggleBefore(false)}
          onPointerCancel={() => onToggleBefore(false)}
          onPointerLeave={() => onToggleBefore(false)}
          className={cn(
            "p-2 rounded-md border text-sm font-medium transition-colors hidden md:flex items-center gap-2",
            isBeforeView ? "bg-rose-500/10 border-rose-500/50 text-rose-400" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
          )}
          title="Hold to see Before"
        >
          <SplitSquareHorizontal className="w-4 h-4" />
          <span>Before</span>
        </button>

        <div className="w-px h-6 bg-neutral-800 mx-2 hidden md:block" />

        <button 
          onClick={onImport}
          className="px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">Open</span>
        </button>
        <button 
          onClick={onExport}
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-90 text-white text-sm font-medium shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Save</span>
        </button>

      </div>
    </div>
  );
}
