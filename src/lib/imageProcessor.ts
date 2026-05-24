import { Adjustments } from '../types';
import { clamp } from './colorUtils';

export function getCropRect(origW: number, origH: number, ratioStr: string) {
  if (ratioStr === 'Original' || !ratioStr) return { x: 0, y: 0, w: origW, h: origH };
  const [rw, rh] = ratioStr.split(':').map(Number);
  const targetRatio = rw / rh;
  const origRatio = origW / origH;
  
  let cw = origW;
  let ch = origH;
  if (origRatio > targetRatio) {
    cw = Math.round(origH * targetRatio);
  } else {
    ch = Math.round(origW / targetRatio);
  }
  const cx = Math.round((origW - cw) / 2);
  const cy = Math.round((origH - ch) / 2);
  return { x: cx, y: cy, w: cw, h: ch };
}

export function applyAdjustments(
  originalData: Uint8ClampedArray,
  targetData: Uint8ClampedArray,
  width: number,
  height: number,
  a: Adjustments
) {
  const data = originalData;
  const out = targetData;
  const len = data.length;

  // Pre-calculate adjustment factors
  const exposureFact = Math.pow(2, a.exposure);
  const contrastChange = (a.contrast + 100) / 100;
  const contrastFact = Math.pow(contrastChange, 2);
  const satFact = a.saturation / 100;
  
  const tempShift = a.temperature; // -100 to 100
  const tintShift = a.tint; // -100 to 100
  
  const highlightsCurve = a.highlights / 100; // -1 to 1
  const shadowsCurve = a.shadows / 100;
  const whitesShift = a.whites; // -100 to 100
  const blacksShift = a.blacks; // -100 to 100
  
  const vibranceFact = a.vibrance / 100;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Temperature & Tint
    if (tempShift !== 0 || tintShift !== 0) {
      r += tempShift * (255 / 100);
      b -= tempShift * (255 / 100);
      g += tintShift * (255 / 100);
    }
    
    // Exposure
    r *= exposureFact;
    g *= exposureFact;
    b *= exposureFact;

    // Contrast
    r = ((r / 255 - 0.5) * contrastFact + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrastFact + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrastFact + 0.5) * 255;

    // Luminance for Shadows/Highlights
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const lumaNormalized = clamp(luma / 255, 0, 1);
    
    // Highlights & Shadows
    // Simple S-curve approximations
    let mult = 1.0;
    if (highlightsCurve !== 0) {
      // Affect only upper midtones and highlights
      const weight = Math.pow(lumaNormalized, 2);
      mult += highlightsCurve * weight;
    }
    if (shadowsCurve !== 0) {
      // Affect only shadows and lower midtones
      const weight = Math.pow(1 - lumaNormalized, 2);
      mult += shadowsCurve * weight;
    }
    
    r *= mult;
    g *= mult;
    b *= mult;
    
    // Whites & Blacks
    if (whitesShift !== 0) {
        const wShift = whitesShift / 100;
        r = r + (r * wShift * Math.pow(lumaNormalized, 2));
        g = g + (g * wShift * Math.pow(lumaNormalized, 2));
        b = b + (b * wShift * Math.pow(lumaNormalized, 2));
    }
    
    if (blacksShift !== 0) {
        const bShift = blacksShift / 100;
        r = r - ((255-r) * -bShift * Math.pow(1-lumaNormalized, 2));
        g = g - ((255-g) * -bShift * Math.pow(1-lumaNormalized, 2));
        b = b - ((255-b) * -bShift * Math.pow(1-lumaNormalized, 2));
    }

    // Saturation & Vibrance
    if (satFact !== 0 || vibranceFact !== 0) {
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      let max = Math.max(r, g, b);
      // vibrance only boosts less saturated colors
      let amt = 1;
      if (vibranceFact !== 0) {
        const sat = max === 0 ? 0 : 1 - (Math.min(r, g, b) / max);
        amt += vibranceFact * (1 - sat); // less saturated = more boost
      }
      
      const satMulti = (satFact + 1) * amt;
      r = l + (r - l) * satMulti;
      g = l + (g - l) * satMulti;
      b = l + (b - l) * satMulti;
    }

    out[i] = clamp(r, 0, 255);
    out[i + 1] = clamp(g, 0, 255);
    out[i + 2] = clamp(b, 0, 255);
    out[i + 3] = data[i+3]; // Alpha remains unchanged
  }
}

// Simple unsharp mask for clarity/sharpness
export function applySharpen(
  targetData: Uint8ClampedArray,
  width: number,
  height: number,
  sharpness: number, // 0 to 100
  clarity: number    // -100 to 100
) {
  // If zero, skip for performance
  if (sharpness === 0 && clarity === 0) return;
  
  // To keep it high performance on the main thread, we will do a very cheap 1-pass convolution
  // depending on the values.
  const strength = sharpness / 100 + (clarity > 0 ? clarity / 200 : 0);
  if(strength <= 0) return;
  
  // Note: a real unsharp mask would be multipass blur + diff. 
  // We'll just do a lightweight 3x3 sharpen filter.
  // 0 -1  0
  //-1  5 -1
  // 0 -1  0
  
  const temp = new Uint8ClampedArray(targetData);
  const mul = strength * 2.0;
  const centerMult = 1 + 4 * mul;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      
      const n = i - width * 4;
      const s = i + width * 4;
      const e = i + 4;
      const w = i - 4;

      for (let c = 0; c < 3; c++) {
        const val = temp[i + c] * centerMult 
                - temp[n + c] * mul 
                - temp[s + c] * mul 
                - temp[e + c] * mul 
                - temp[w + c] * mul;
        targetData[i + c] = clamp(val, 0, 255);
      }
    }
  }
}
