export interface Adjustments {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  saturation: number;
  vibrance: number;
  temperature: number;
  tint: number;
  clarity: number;
  sharpness: number;
  cropRatio: 'Original' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';
}

export const defaultAdjustments: Adjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  clarity: 0,
  sharpness: 0,
  cropRatio: 'Original',
};

export interface HistogramData {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
}

export interface Preset {
  id: string;
  name: string;
  adjustments: Adjustments;
  isBuiltIn?: boolean;
}

export interface ImageRecord {
  id: string;
  file: File;
  url: string;
  name: string;
  adjustments: Adjustments;
  history: Adjustments[];
  historyIndex: number;
}

export interface EditorState {
  images: ImageRecord[];
  currentIndex: number;
  viewMode: 'editor' | 'library';
  isBeforeView: boolean;
  presets: Preset[];
  activePresetId: string | null;
  copiedSettings: Adjustments | null;
}
