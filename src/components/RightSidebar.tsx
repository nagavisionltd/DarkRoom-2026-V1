import React from 'react';
import { Adjustments } from '../types';
import { Slider } from './Slider';
import { Sun, Palette, Droplets, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Histogram } from './Histogram';

interface RightSidebarProps {
  adjustments: Adjustments;
  onChange: (key: keyof Adjustments, val: number) => void;
  onReset: () => void;
  histogramData?: import('../types').HistogramData | null;
}

const PanelSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="mb-6 pb-6 border-b border-neutral-800 last:border-b-0">
    <div className="flex items-center gap-2 mb-4 text-neutral-100 font-semibold tracking-wide uppercase text-[11px]">
      {icon}
      {title}
    </div>
    <div className="flex flex-col gap-5">
      {children}
    </div>
  </div>
);

export function RightSidebar({ adjustments, onChange, onReset, histogramData }: RightSidebarProps) {

  return (
    <div className="w-[320px] h-full bg-[#111111] overflow-y-auto border-l border-neutral-800 flex flex-col shrink-0 custom-scrollbar relative z-10">
      <div className="sticky top-0 bg-[#111111]/90 backdrop-blur-md p-4 flex justify-between items-center border-b border-neutral-800 z-10">
        <h2 className="text-sm font-semibold text-white tracking-wide">Edit Image</h2>
        <button 
          onClick={onReset}
          className="text-neutral-400 hover:text-white transition-colors p-1 rounded-md hover:bg-neutral-800"
          title="Reset All"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-5">
        <Histogram data={histogramData ?? null} />
        
        <PanelSection title="Light" icon={<Sun className="w-4 h-4 text-orange-400" />}>
           <Slider label="Exposure" tooltip="Adjusts the overall brightness of the image." min={-5} max={5} step={0.1} value={adjustments.exposure} onChange={(v) => onChange('exposure', v)} onDoubleClick={() => onChange('exposure', 0)} />
           <Slider label="Contrast" tooltip="Increases or decreases the difference between light and dark areas." min={-100} max={100} value={adjustments.contrast} onChange={(v) => onChange('contrast', v)} onDoubleClick={() => onChange('contrast', 0)} />
           <Slider label="Highlights" tooltip="Adjusts the brightness of the lightest parts of the image." min={-100} max={100} value={adjustments.highlights} onChange={(v) => onChange('highlights', v)} onDoubleClick={() => onChange('highlights', 0)} />
           <Slider label="Shadows" tooltip="Adjusts the brightness of the darkest parts of the image." min={-100} max={100} value={adjustments.shadows} onChange={(v) => onChange('shadows', v)} onDoubleClick={() => onChange('shadows', 0)} />
           <Slider label="Whites" tooltip="Sets the absolute white point for extreme highlights." min={-100} max={100} value={adjustments.whites} onChange={(v) => onChange('whites', v)} onDoubleClick={() => onChange('whites', 0)} />
           <Slider label="Blacks" tooltip="Sets the absolute black point for deep shadows." min={-100} max={100} value={adjustments.blacks} onChange={(v) => onChange('blacks', v)} onDoubleClick={() => onChange('blacks', 0)} />
        </PanelSection>

        <PanelSection title="Color" icon={<Palette className="w-4 h-4 text-rose-400" />}>
           <Slider label="Temp" tooltip="Warms or cools the color balance (amber vs. blue)." min={-100} max={100} value={adjustments.temperature} onChange={(v) => onChange('temperature', v)} onDoubleClick={() => onChange('temperature', 0)} />
           <Slider label="Tint" tooltip="Adjusts the color balance toward green or magenta." min={-100} max={100} value={adjustments.tint} onChange={(v) => onChange('tint', v)} onDoubleClick={() => onChange('tint', 0)} />
           <Slider label="Vibrance" tooltip="Boosts dull colors without oversaturating skin tones." min={-100} max={100} value={adjustments.vibrance} onChange={(v) => onChange('vibrance', v)} onDoubleClick={() => onChange('vibrance', 0)} />
           <Slider label="Saturation" tooltip="Adjusts the intensity of all colors equally." min={-100} max={100} value={adjustments.saturation} onChange={(v) => onChange('saturation', v)} onDoubleClick={() => onChange('saturation', 0)} />
        </PanelSection>

        <PanelSection title="Detail" icon={<Droplets className="w-4 h-4 text-neutral-400" />}>
           <Slider label="Clarity" tooltip="Enhances midtone contrast to add depth and punch." min={-100} max={100} value={adjustments.clarity} onChange={(v) => onChange('clarity', v)} onDoubleClick={() => onChange('clarity', 0)} />
           <Slider label="Sharpness" tooltip="Enhances edge definition." min={0} max={100} value={adjustments.sharpness} onChange={(v) => onChange('sharpness', v)} onDoubleClick={() => onChange('sharpness', 0)} />
        </PanelSection>
      </div>
    </div>
  );
}
