import React, { useState } from 'react';
import { Preset } from '../types';
import { Plus, Trash2, Sliders, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface LeftSidebarProps {
  presets: Preset[];
  onApplyPreset: (p: Preset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  activePresetId: string | null;
}

export function LeftSidebar({ presets, onApplyPreset, onSavePreset, onDeletePreset, activePresetId }: LeftSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    if (newName.trim()) {
      onSavePreset(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-[240px] h-full bg-[#111111] overflow-y-auto border-r border-neutral-800 flex flex-col shrink-0 custom-scrollbar relative z-10 hidden lg:flex">
      <div className="sticky top-0 bg-[#111111]/90 backdrop-blur-md p-4 flex justify-between items-center border-b border-neutral-800 z-10">
        <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 font-display">
          <Sliders className="w-4 h-4 text-neutral-400" />
          Presets
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-800"
          title="Save Current as Preset"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {isAdding && (
          <div className="mb-4 bg-neutral-900 border border-neutral-800 p-3 rounded-lg relative flex flex-col gap-2 shadow-inner">
            <input 
              autoFocus
              type="text" 
              placeholder="Preset name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full bg-[#111] border border-neutral-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsAdding(false)} className="text-xs text-neutral-500 hover:text-neutral-300">Cancel</button>
              <button onClick={handleSave} className="text-xs text-gradient bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-80 font-semibold px-1">Save</button>
            </div>
          </div>
        )}

        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1 mt-2">Your Presets</div>

        {presets.map(p => (
          <div 
            key={p.id} 
            className={cn(
              "group relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
              activePresetId === p.id ? "border-rose-500/50 bg-rose-500/10" : "border-transparent hover:border-neutral-800 hover:bg-neutral-900"
            )} 
            onClick={() => onApplyPreset(p)}
          >
            <div className="flex items-center gap-2 truncate">
              {activePresetId === p.id && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
              <span className={cn(
                "text-sm font-medium truncate",
                activePresetId === p.id ? "text-rose-400" : "text-neutral-300 group-hover:text-white"
              )}>{p.name}</span>
            </div>
            {!p.isBuiltIn && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeletePreset(p.id); }}
                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-500 transition-colors p-1"
                title="Delete preset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {presets.length === 0 && !isAdding && (
          <div className="text-center text-neutral-600 text-xs mt-4 pb-4">
            No presets saved yet.
          </div>
        )}
      </div>
    </div>
  );
}
