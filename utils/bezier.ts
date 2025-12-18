import { Point } from '../types';

/**
 * Solves the Cubic Bezier curve for a given x to find y.
 * Based on WebKit's implementation for CSS timing functions.
 * P0 is (0,0), P3 is (1,1).
 */
export function solveCubicBezier(x: number, p1: Point, p2: Point): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // If curve is linear, return x
  if (p1.x === p1.y && p2.x === p2.y && p1.x === 0.0 && p2.x === 1.0) {
    return x;
  }

  // Newton-Raphson iteration
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xEst = sampleCurveX(t, p1.x, p2.x);
    if (Math.abs(xEst - x) < 1e-6) return sampleCurveY(t, p1.y, p2.y);
    const dX = sampleCurveDerivativeX(t, p1.x, p2.x);
    if (Math.abs(dX) < 1e-6) break;
    t = t - (xEst - x) / dX;
  }
  
  // Fallback to binary subdivision if Newton failed or out of bounds
  // (Usually unnecessary for easing functions but good for stability)
  if (t < 0 || t > 1) {
     let start = 0.0;
     let end = 1.0;
     t = x;
     while (start < end) {
       t = start + (end - start) / 2;
       const xEst = sampleCurveX(t, p1.x, p2.x);
       if (Math.abs(xEst - x) < 1e-6) break;
       if (xEst > x) end = t;
       else start = t;
     }
  }

  return sampleCurveY(t, p1.y, p2.y);
}

function sampleCurveX(t: number, p1x: number, p2x: number) {
  return (3 * Math.pow(1 - t, 2) * t * p1x) + (3 * (1 - t) * Math.pow(t, 2) * p2x) + Math.pow(t, 3);
}

function sampleCurveY(t: number, p1y: number, p2y: number) {
  return (3 * Math.pow(1 - t, 2) * t * p1y) + (3 * (1 - t) * Math.pow(t, 2) * p2y) + Math.pow(t, 3);
}

function sampleCurveDerivativeX(t: number, p1x: number, p2x: number) {
  return (3 * Math.pow(1 - t, 2) * p1x) + (6 * (1 - t) * t * (p2x - p1x)) + (3 * Math.pow(t, 2) * (1 - p2x));
}

function sampleCurveDerivativeY(t: number, p1y: number, p2y: number) {
  return (3 * Math.pow(1 - t, 2) * p1y) + (6 * (1 - t) * t * (p2y - p1y)) + (3 * Math.pow(t, 2) * (1 - p2y));
}

/**
 * Calculate the rate of change (derivative magnitude) of the bezier curve at x position.
 * Higher values indicate rapid changes, lower values indicate slow changes.
 */
export function getCurveDerivativeMagnitude(x: number, p1: Point, p2: Point): number {
  if (x <= 0 || x >= 1) return 1;
  
  // Find t that corresponds to x
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xEst = sampleCurveX(t, p1.x, p2.x);
    if (Math.abs(xEst - x) < 1e-6) break;
    const dX = sampleCurveDerivativeX(t, p1.x, p2.x);
    if (Math.abs(dX) < 1e-6) break;
    t = t - (xEst - x) / dX;
  }
  
  const dX = sampleCurveDerivativeX(t, p1.x, p2.x);
  const dY = sampleCurveDerivativeY(t, p1.y, p2.y);
  
  // Return magnitude of derivative vector (rate of change)
  return Math.sqrt(dX * dX + dY * dY);
}

/**
 * Generate adaptive sample positions based on the curve's rate of change.
 * Areas with rapid changes get more samples.
 */
export function generateAdaptiveSamples(
  count: number,
  p1: Point,
  p2: Point
): number[] {
  // Calculate derivative magnitudes at uniform positions
  const uniformSamples = 100;
  const magnitudes: number[] = [];
  let totalMagnitude = 0;
  
  for (let i = 0; i <= uniformSamples; i++) {
    const x = i / uniformSamples;
    const mag = getCurveDerivativeMagnitude(x, p1, p2);
    magnitudes.push(mag);
    totalMagnitude += mag;
  }
  
  // Generate adaptive positions based on cumulative magnitude
  const positions: number[] = [0]; // Always start at 0
  let targetMagnitude = totalMagnitude / count;
  let accumulatedMagnitude = 0;
  
  for (let i = 0; i < uniformSamples; i++) {
    accumulatedMagnitude += magnitudes[i];
    
    while (accumulatedMagnitude >= targetMagnitude && positions.length < count) {
      // Interpolate position within this segment
      const segmentStart = i / uniformSamples;
      const segmentEnd = (i + 1) / uniformSamples;
      const segmentMag = magnitudes[i];
      const overflow = accumulatedMagnitude - targetMagnitude;
      const ratio = 1 - (overflow / segmentMag);
      const position = segmentStart + ratio * (segmentEnd - segmentStart);
      
      positions.push(Math.max(0, Math.min(1, position)));
      accumulatedMagnitude -= targetMagnitude;
    }
  }
  
  // Ensure we end at 1
  if (positions[positions.length - 1] !== 1) {
    positions.push(1);
  }
  
  // Trim to exact count if we have too many
  while (positions.length > count + 1) {
    positions.pop();
  }
  
  return positions;
}
