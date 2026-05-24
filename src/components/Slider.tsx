import React, { useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { Info } from 'lucide-react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  onDoubleClick?: () => void;
  className?: string;
  tooltip?: string;
}

export function Slider({ label, value, min, max, step = 1, onChange, onDoubleClick, className, tooltip }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate percentage
  let pct = ((value - min) / (max - min)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  
  // Center point for bipolar sliders (like -100 to 100)
  const isBipolar = min < 0 && max > 0;
  const zeroPct = isBipolar ? ((0 - min) / (max - min)) * 100 : 0;
  
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateValue(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const updateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let newPct = x / rect.width;
    newPct = Math.max(0, Math.min(1, newPct));
    let newVal = min + newPct * (max - min);
    // snap to step
    newVal = Math.round(newVal / step) * step;
    onChange(newVal);
  };

  return (
    <div 
      className={cn("flex flex-col group touch-none select-none", className)}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex justify-between items-center mb-2 px-1 text-xs text-neutral-300 font-medium tracking-wide">
        <div className="flex items-center gap-1.5 group/info relative">
          <span>{label}</span>
          {tooltip && (
            <>
              <Info className="w-[11px] h-[11px] text-neutral-600 hover:text-neutral-400 transition-colors cursor-help md:flex hidden" />
              <Info 
                className="w-[11px] h-[11px] text-neutral-500 md:hidden flex touch-manipulation cursor-help" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
              />
              <div className="absolute left-0 bottom-full mb-1 w-48 p-2 bg-neutral-800 text-[10px] leading-relaxed text-neutral-200 rounded shadow-xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 border border-neutral-700 font-normal normal-case tracking-normal">
                {tooltip}
              </div>
            </>
          )}
        </div>
        <span className="text-neutral-400 group-hover:text-rose-400 transition-colors">{value > 0 ? `+${value}` : value}</span>
      </div>
      <div 
        className="relative h-6 flex items-center cursor-ew-resize py-2 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div ref={trackRef} className="absolute w-full h-[4px] bg-neutral-800 rounded-full overflow-hidden">
          {/* Fill Bar */}
          {isBipolar ? (
             <div 
               className={cn(
                 "absolute h-full top-0  transition-colors rounded-full",
                 value >= 0 ? "bg-gradient-to-r from-orange-500 to-rose-600" : "bg-neutral-400"
               )}
               style={{
                 left: value >= 0 ? `${zeroPct}%` : `${pct}%`,
                 width: value >= 0 ? `${pct - zeroPct}%` : `${zeroPct - pct}%`
               }}
             />
          ) : (
            <div 
               className="absolute h-full top-0 left-0 bg-gradient-to-r from-orange-500 to-rose-600 rounded-full"
               style={{ width: `${pct}%` }}
             />
          )}
          
          {/* Zero Indicator */}
          {isBipolar && (
            <div className="absolute top-0 w-0.5 h-full bg-neutral-600" style={{ left: `${zeroPct}%` }} />
          )}
        </div>
        
        {/* Thumb */}
        <div 
          className="absolute w-4 h-4 rounded-full bg-white shadow-md border-[1.5px] border-neutral-200 pointer-events-none transform -translate-x-1/2 transition-transform duration-100 ease-out z-10"
          style={{ left: `${pct}%`, transform: `translate(-50%, ${isDragging ? 'scale(1.2)' : 'scale(1)'})` }}
        />
      </div>
    </div>
  );
}
