import { ColorStop } from '../types';
import { rgbToHex } from './color';

/**
 * Parse gradient stops from various formats
 */
export function parseGradientStops(text: string): ColorStop[] | null {
  // Try Swift format first
  const swiftStops = parseSwiftFormat(text);
  if (swiftStops) return swiftStops;

  // Try CSS gradient format
  const cssStops = parseCSSGradient(text);
  if (cssStops) return cssStops;

  // Try RGBA list format
  const rgbaStops = parseRGBAList(text);
  if (rgbaStops) return rgbaStops;

  // Try hex color list format
  const hexStops = parseHexList(text);
  if (hexStops) return hexStops;

  return null;
}

/**
 * Parse Swift Gradient.Stop format
 * Example: Gradient.Stop(color: Color(red: 0.92, green: 0.84, blue: 0.92), location: 0.00)
 */
function parseSwiftFormat(text: string): ColorStop[] | null {
  const stopRegex = /Gradient\.Stop\s*\(\s*color:\s*Color\s*\(\s*red:\s*([\d.]+)\s*,\s*green:\s*([\d.]+)\s*,\s*blue:\s*([\d.]+)\s*\)\s*,\s*location:\s*([\d.]+)\s*\)/gi;
  const matches = Array.from(text.matchAll(stopRegex));

  if (matches.length === 0) return null;

  return matches.map((match, index) => {
    const r = parseFloat(match[1]);
    const g = parseFloat(match[2]);
    const b = parseFloat(match[3]);
    const position = parseFloat(match[4]);

    return {
      id: Math.random().toString(36).substr(2, 9),
      color: rgbToHex(r, g, b),
      position: Math.max(0, Math.min(1, position)),
    };
  });
}

/**
 * Parse CSS gradient format
 * Example: background: radial-gradient(326.45% 100% at 50.11% 100%, #EBD5EB 0%, #A1BEE8 47.12%, #807BCA 100%);
 * Or: linear-gradient(90deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)
 */
function parseCSSGradient(text: string): ColorStop[] | null {
  // Match linear-gradient or radial-gradient
  const gradientRegex = /(?:linear|radial|conic)-gradient\s*\([^)]+\)/gi;
  const match = text.match(gradientRegex);

  if (!match) return null;

  const gradientContent = match[0];
  
  // Extract color stops: either hex colors or rgb/rgba
  // Pattern: (#hex or rgb(a)(...)) followed by optional percentage/position
  const stopRegex = /(#[0-9a-f]{3,8}|rgba?\([^)]+\))\s*([\d.]+%?)?/gi;
  const stops = Array.from(gradientContent.matchAll(stopRegex));

  if (stops.length === 0) return null;

  return stops.map((stop, index) => {
    let color = stop[1];
    let position = stop[2];

    // Convert rgba to hex if needed
    if (color.startsWith('rgb')) {
      color = rgbaToHex(color);
    }

    // Parse position
    let pos: number;
    if (position) {
      pos = parseFloat(position) / (position.includes('%') ? 100 : 1);
    } else {
      // If no position specified, distribute evenly
      pos = stops.length > 1 ? index / (stops.length - 1) : 0;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      color: color,
      position: Math.max(0, Math.min(1, pos)),
    };
  });
}

/**
 * Parse RGBA list format
 * Example: rgba(235, 213, 235, 1), rgba(161, 190, 232, 1), rgba(128, 123, 202, 1)
 */
function parseRGBAList(text: string): ColorStop[] | null {
  const rgbaRegex = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/gi;
  const matches = Array.from(text.matchAll(rgbaRegex));

  if (matches.length === 0) return null;

  return matches.map((match, index) => {
    const r = parseInt(match[1]) / 255;
    const g = parseInt(match[2]) / 255;
    const b = parseInt(match[3]) / 255;

    // Distribute evenly across gradient
    const position = matches.length > 1 ? index / (matches.length - 1) : 0;

    return {
      id: Math.random().toString(36).substr(2, 9),
      color: rgbToHex(r, g, b),
      position,
    };
  });
}

/**
 * Parse hex color list format
 * Example: #ff0000, #00ff00, #0000ff
 * or just: #ff0000 #00ff00 #0000ff
 */
function parseHexList(text: string): ColorStop[] | null {
  const hexRegex = /#[0-9a-f]{3,8}/gi;
  const matches = Array.from(text.matchAll(hexRegex));

  if (matches.length < 2) return null; // Need at least 2 colors for a gradient

  return matches.map((match, index) => {
    const position = matches.length > 1 ? index / (matches.length - 1) : 0;

    return {
      id: Math.random().toString(36).substr(2, 9),
      color: match[0],
      position,
    };
  });
}

/**
 * Convert rgba(r, g, b, a) to hex
 */
function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/);
  if (!match) return '#000000';

  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;

  return rgbToHex(r, g, b);
}
