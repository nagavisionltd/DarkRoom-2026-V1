import React, { useState } from 'react';
import { Adjustments, Preset } from '../types';
import { Slider } from './Slider';
import { Sun, Palette, Droplets, SlidersHorizontal, Sliders, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileControlsProps {
  adjustments: Adjustments;
  onChange: (key: keyof Adjustments, val: number) => void;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  presets: Preset[];
  onApplyPreset: (p: Preset) => void;
  activePresetId: string | null;
}

export function MobileControls({ adjustments, onChange, isOpen, setIsOpen, presets, onApplyPreset, activePresetId }: MobileControlsProps) {
  const [activeTab, setActiveTab] = useState<'light'|'color'|'detail'|'presets'>('light');

  const TabBtn = ({ id, icon, label }: any) => (
    <button 
      onClick={() => {
        if (activeTab === id && isOpen) {
          setIsOpen(false);
        } else {
          setActiveTab(id);
          setIsOpen(true);
        }
      }}
      className={cn(
        "flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors border-t-2",
        activeTab === id && isOpen ? "border-rose-500 text-rose-500" : "border-transparent text-neutral-400 hover:text-neutral-200"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <>
      {/* Sliding Panel */}
      <div 
        className={cn(
          "md:hidden fixed bottom-[64px] left-0 right-0 bg-[#111111] border-t border-neutral-800 transition-all duration-300 z-40 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] rounded-t-2xl overflow-hidden",
          isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="h-[280px] overflow-y-auto overflow-x-hidden p-5 flex flex-col gap-6 custom-scrollbar pb-6 relative">
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-2 bg-neutral-900 rounded-full text-neutral-400 hover:text-white border border-neutral-800 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {activeTab === 'light' && (
            <div className="flex flex-col gap-5 mt-4">
               <Slider label="Exposure" tooltip="Adjusts overall brightness." min={-5} max={5} step={0.1} value={adjustments.exposure} onChange={(v) => onChange('exposure', v)} onDoubleClick={() => onChange('exposure', 0)} />
               <Slider label="Contrast" tooltip="Difference between light and dark." min={-100} max={100} value={adjustments.contrast} onChange={(v) => onChange('contrast', v)} onDoubleClick={() => onChange('contrast', 0)} />
               <Slider label="Highlights" tooltip="Adjusts safest brights." min={-100} max={100} value={adjustments.highlights} onChange={(v) => onChange('highlights', v)} onDoubleClick={() => onChange('highlights', 0)} />
               <Slider label="Shadows" tooltip="Adjusts safe darks." min={-100} max={100} value={adjustments.shadows} onChange={(v) => onChange('shadows', v)} onDoubleClick={() => onChange('shadows', 0)} />
               <Slider label="Whites" tooltip="Extreme bright point." min={-100} max={100} value={adjustments.whites} onChange={(v) => onChange('whites', v)} onDoubleClick={() => onChange('whites', 0)} />
               <Slider label="Blacks" tooltip="Extreme dark point." min={-100} max={100} value={adjustments.blacks} onChange={(v) => onChange('blacks', v)} onDoubleClick={() => onChange('blacks', 0)} />
            </div>
          )}

          {activeTab === 'color' && (
            <div className="flex flex-col gap-5 mt-4">
               <Slider label="Temp" tooltip="Warms or cools color balance." min={-100} max={100} value={adjustments.temperature} onChange={(v) => onChange('temperature', v)} onDoubleClick={() => onChange('temperature', 0)} />
               <Slider label="Tint" tooltip="Adjusts green to magenta." min={-100} max={100} value={adjustments.tint} onChange={(v) => onChange('tint', v)} onDoubleClick={() => onChange('tint', 0)} />
               <Slider label="Vibrance" tooltip="Boosts dullest colors." min={-100} max={100} value={adjustments.vibrance} onChange={(v) => onChange('vibrance', v)} onDoubleClick={() => onChange('vibrance', 0)} />
               <Slider label="Saturation" tooltip="Intensity of all colors." min={-100} max={100} value={adjustments.saturation} onChange={(v) => onChange('saturation', v)} onDoubleClick={() => onChange('saturation', 0)} />
            </div>
          )}

          {activeTab === 'detail' && (
            <div className="flex flex-col gap-5 mt-4">
               <Slider label="Clarity" tooltip="Enhances midtone contrast." min={-100} max={100} value={adjustments.clarity} onChange={(v) => onChange('clarity', v)} onDoubleClick={() => onChange('clarity', 0)} />
               <Slider label="Sharpness" tooltip="Edge definition." min={0} max={100} value={adjustments.sharpness} onChange={(v) => onChange('sharpness', v)} onDoubleClick={() => onChange('sharpness', 0)} />
            </div>
          )}
          {activeTab === 'presets' && (
            <div className="flex flex-col gap-3 mt-4">
               {presets.map(p => (
                 <div 
                   key={p.id}
                   className={cn(
                     "flex items-center gap-3 p-4 rounded-lg border transition-all active:scale-[0.98]",
                     activePresetId === p.id ? "bg-rose-500/10 border-rose-500/50" : "bg-neutral-900 border-neutral-800"
                   )}
                   onClick={() => onApplyPreset(p)}
                 >
                   <div className="flex-1 text-sm font-medium text-white">{p.name}</div>
                   {activePresetId === p.id && <Check className="w-4 h-4 text-rose-500" />}
                 </div>
               ))}
               {presets.length === 0 && (
                 <div className="text-center text-neutral-500 text-sm mt-4">No presets available.</div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Tab Bar */}
      <div className="md:hidden flex items-center w-full bg-[#141414] border-t border-neutral-800 h-16 px-2 shrink-0 z-50">
        <TabBtn id="presets" icon={<Sliders className="w-5 h-5" />} label="Presets" />
        <TabBtn id="light" icon={<Sun className="w-5 h-5" />} label="Light" />
        <TabBtn id="color" icon={<Palette className="w-5 h-5" />} label="Color" />
        <TabBtn id="detail" icon={<Droplets className="w-5 h-5" />} label="Detail" />
        <button 
           onClick={() => setIsOpen(!isOpen)}
           className={cn("flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors border-t-2", isOpen ? "border-white text-white" : "border-transparent text-neutral-400")}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wide">Adjust</span>
        </button>
      </div>
    </>
  );
}
