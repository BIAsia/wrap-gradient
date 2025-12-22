export interface ColorStop {
  id: string;
  color: string; // Hex
  position: number; // 0 to 1
}

export interface Point {
  x: number;
  y: number;
}

export interface BezierCurve {
  p1: Point;
  p2: Point;
}

export enum InterpolationMode {
  RGB = 'rgb',
  OKLAB = 'oklab',
  OKLCH = 'oklch',
  LCH = 'lch',
}

export enum ExportFormat {
  CSS = 'css',
  SWIFT = 'swift',
  COMPOSE = 'compose',
  ANDROID_XML = 'android_xml',
  SVG = 'svg',
  FIGMA = 'figma'
}
