import { InterpolationMode } from '../types';

// Helper: Hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
}

// Helper: RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Linear interpolation
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// --- RGB ---
function interpolateRgb(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

// --- OKLAB / OKLCH Conversions ---
// Adapted from standard implementations (e.g., Björn Ottosson, CSS Color 4)

// RGB to Linear RGB
function srgbTransfer(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
// Linear RGB to RGB
function srgbTransferInv(v: number): number {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbTransfer(r);
  const lg = srgbTransfer(g);
  const lb = srgbTransfer(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    srgbTransferInv(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    srgbTransferInv(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    srgbTransferInv(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const [L, a, bb] = rgbToOklab(r, g, b);
  const C = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [L, C, h];
}

function oklchToRgb(L: number, C: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return oklabToRgb(L, a, b);
}

// --- Main Interpolator ---

export function interpolateColor(
  c1: string,
  c2: string,
  t: number,
  mode: InterpolationMode
): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);

  if (mode === InterpolationMode.RGB) {
    return interpolateRgb(c1, c2, t);
  }

  if (mode === InterpolationMode.OKLAB) {
    const [L1, a1, bb1] = rgbToOklab(r1, g1, b1);
    const [L2, a2, bb2] = rgbToOklab(r2, g2, b2);
    const L = lerp(L1, L2, t);
    const a = lerp(a1, a2, t);
    const b = lerp(bb1, bb2, t);
    const [r, g, bb] = oklabToRgb(L, a, b);
    return rgbToHex(r, g, bb);
  }

  if (mode === InterpolationMode.OKLCH) {
    const [L1, C1, h1] = rgbToOklch(r1, g1, b1);
    const [L2, C2, h2] = rgbToOklch(r2, g2, b2);
    
    const L = lerp(L1, L2, t);
    const C = lerp(C1, C2, t);
    
    // Hue interpolation needs to take shortest path
    let dh = h2 - h1;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    const h = h1 + dh * t;
    
    const [r, g, b] = oklchToRgb(L, C, h);
    return rgbToHex(r, g, b);
  }

  // Fallback to RGB
  return interpolateRgb(c1, c2, t);
}
