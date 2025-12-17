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
