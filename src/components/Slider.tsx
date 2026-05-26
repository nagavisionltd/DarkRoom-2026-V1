import React from 'react';
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
  };

  let pct = ((value - min) / (max - min)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  const isBipolar = min < 0 && max > 0;
  const zeroPct = isBipolar ? ((0 - min) / (max - min)) * 100 : 0;

  const trackBg = isBipolar
    ? (value >= 0
        ? `linear-gradient(to right, #262626 0%, #262626 ${zeroPct}%, #ea580c ${zeroPct}%, #e11d48 ${pct}%, #262626 ${pct}%, #262626 100%)`
        : `linear-gradient(to right, #262626 0%, #262626 ${pct}%, #a3a3a3 ${pct}%, #a3a3a3 ${zeroPct}%, #262626 ${zeroPct}%, #262626 100%)`
      )
    : `linear-gradient(to right, #ea580c 0%, #e11d48 ${pct}%, #262626 ${pct}%, #262626 100%)`;

  return (
    <div 
      className={cn("flex flex-col group", className)}
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
      
      <div className="relative h-6 flex items-center w-full">
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="darkroom-range w-full"
          style={{ '--slider-track-bg': trackBg } as React.CSSProperties}
        />
        
        {isBipolar && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-neutral-600 pointer-events-none z-10" 
            style={{ left: `${zeroPct}%` }} 
          />
        )}
      </div>
    </div>
  );
}

