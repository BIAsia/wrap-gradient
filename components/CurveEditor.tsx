import React, { useRef, useState, useEffect } from 'react';
import { BezierCurve, Point } from '../types';

interface CurveEditorProps {
  curve: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

const HANDLE_RADIUS = 6;
const PADDING = 20;

export const CurveEditor: React.FC<CurveEditorProps> = ({ curve, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<'p1' | 'p2' | null>(null);

  // Convert normalized (0-1) to SVG coordinates
  const toSvg = (p: Point, width: number, height: number) => ({
    x: PADDING + p.x * (width - PADDING * 2),
    y: height - (PADDING + p.y * (height - PADDING * 2)), // Invert Y
  });

  // Convert SVG to normalized
  const fromSvg = (x: number, y: number, width: number, height: number) => ({
    x: Math.max(0, Math.min(1, (x - PADDING) / (width - PADDING * 2))),
    y: Math.max(0, Math.min(1, (height - y - PADDING) / (height - PADDING * 2))), // Invert Y back
  });

  const handlePointerDown = (point: 'p1' | 'p2') => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(point);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const newPoint = fromSvg(e.clientX - rect.left, e.clientY - rect.top, width, height);
    
    onChange({
      ...curve,
      [dragging]: newPoint
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const width = 240;
  const height = 240;
  const drawW = width;
  const drawH = height;

  const p0 = { x: 0, y: 0 };
  const p3 = { x: 1, y: 1 };
  
  const sp0 = toSvg(p0, drawW, drawH);
  const sp1 = toSvg(curve.p1, drawW, drawH);
  const sp2 = toSvg(curve.p2, drawW, drawH);
  const sp3 = toSvg(p3, drawW, drawH);

  const pathD = `M ${sp0.x} ${sp0.y} C ${sp1.x} ${sp1.y}, ${sp2.x} ${sp2.y}, ${sp3.x} ${sp3.y}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white rounded-lg border shadow-sm select-none touch-none" style={{ width, height }}>
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="black" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          className="overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Connecting Lines */}
          <line x1={sp0.x} y1={sp0.y} x2={sp1.x} y2={sp1.y} stroke="#e5e5e5" strokeWidth="2" />
          <line x1={sp3.x} y1={sp3.y} x2={sp2.x} y2={sp2.y} stroke="#e5e5e5" strokeWidth="2" />

          {/* Bezier Curve */}
          <path d={pathD} fill="none" stroke="currentColor" strokeWidth="3" className="text-stone-900" />

          {/* Handle P1 */}
          <g transform={`translate(${sp1.x}, ${sp1.y})`} className="cursor-pointer" onPointerDown={handlePointerDown('p1')}>
             <circle r={HANDLE_RADIUS} className="fill-amber-500 stroke-white stroke-2 shadow-sm transition-transform hover:scale-125" />
          </g>

          {/* Handle P2 */}
          <g transform={`translate(${sp2.x}, ${sp2.y})`} className="cursor-pointer" onPointerDown={handlePointerDown('p2')}>
             <circle r={HANDLE_RADIUS} className="fill-amber-600 stroke-white stroke-2 shadow-sm transition-transform hover:scale-125" />
          </g>
          
          {/* Endpoints */}
          <circle cx={sp0.x} cy={sp0.y} r="4" className="fill-stone-400" />
          <circle cx={sp3.x} cy={sp3.y} r="4" className="fill-stone-400" />
        </svg>
      </div>
      <div className="flex gap-2 mt-4">
          <PresetButton name="Linear" p1={{x:0, y:0}} p2={{x:1, y:1}} onSelect={onChange} />
          <PresetButton name="Ease In" p1={{x:0.42, y:0}} p2={{x:1, y:1}} onSelect={onChange} />
          <PresetButton name="Ease Out" p1={{x:0, y:0}} p2={{x:0.58, y:1}} onSelect={onChange} />
          <PresetButton name="Ease In Out" p1={{x:0.42, y:0}} p2={{x:0.58, y:1}} onSelect={onChange} />
      </div>
    </div>
  );
};

const PresetButton = ({ name, p1, p2, onSelect }: { name: string, p1: Point, p2: Point, onSelect: (c: BezierCurve) => void }) => (
    <button 
        className="px-2 py-1 text-xs font-medium rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
        onClick={() => onSelect({ p1, p2 })}
    >
        {name}
    </button>
)
