import React, { useRef, useState } from 'react';
import { BezierCurve, Point } from '../types';

interface CurveEditorProps {
  curve: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

const PRESETS = [
  { label: 'Smooth', p1: { x: 0.4, y: 0 }, p2: { x: 0.2, y: 1 } },
  { label: 'Linear', p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } },
  { label: 'Ease in', p1: { x: 0.42, y: 0 }, p2: { x: 1, y: 1 } },
  { label: 'Ease out', p1: { x: 0, y: 0 }, p2: { x: 0.58, y: 1 } },
  { label: 'Ease in out', p1: { x: 0.42, y: 0 }, p2: { x: 0.58, y: 1 } },
];

export const CurveEditor: React.FC<CurveEditorProps> = ({ curve, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<'p1' | 'p2' | null>(null);

  const size = 200;
  const padding = 20;
  const graphSize = size - padding * 2;

  const toSvg = (p: Point) => ({
    x: padding + p.x * graphSize,
    y: size - (padding + p.y * graphSize)
  });

  const fromSvg = (x: number, y: number) => ({
    x: Math.max(0, Math.min(1, (x - padding) / graphSize)),
    y: Math.max(0, Math.min(1, (size - y - padding) / graphSize))
  });

  const handlePointerDown = (point: 'p1' | 'p2') => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(point);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Slight transform correction if needed, but clientX/Y relative to rect is usually solid
    const newPoint = fromSvg(x, y);

    onChange({
      ...curve,
      [dragging]: newPoint
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const sp1 = toSvg(curve.p1);
  const sp2 = toSvg(curve.p2);
  const start = toSvg({ x: 0, y: 0 });
  const end = toSvg({ x: 1, y: 1 });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm text-stone-500 font-medium">Mix curve</h2>
        <span className="text-[10px] text-stone-500 font-mono hidden sm:inline-block">
          cubic-bezier({curve.p1.x.toFixed(2)}, {curve.p1.y.toFixed(2)}, {curve.p2.x.toFixed(2)}, {curve.p2.y.toFixed(2)})
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            ref={svgRef}
            width={size}
            height={size}
            className="overflow-visible touch-none select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Grid */}
            <path d={`M ${padding} ${padding} V ${size - padding} H ${size - padding}`}
              stroke="#333" strokeWidth="1" fill="none" />

            {/* Inner Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const pos = padding + t * graphSize;
              const yPos = size - (padding + t * graphSize);
              if (t === 0 || t === 1) return null;
              return (
                <g key={t}>
                  <line x1={pos} y1={padding} x2={pos} y2={size - padding} stroke="#222" strokeWidth="1" />
                  <line x1={padding} y1={yPos} x2={size - padding} y2={yPos} stroke="#222" strokeWidth="1" />
                </g>
              )
            })}

            {/* Connecting Handles */}
            <line x1={start.x} y1={start.y} x2={sp1.x} y2={sp1.y} stroke="#444" strokeWidth="1" />
            <line x1={end.x} y1={end.y} x2={sp2.x} y2={sp2.y} stroke="#444" strokeWidth="1" />

            {/* Curve */}
            <path
              d={`M ${start.x} ${start.y} C ${sp1.x} ${sp1.y}, ${sp2.x} ${sp2.y}, ${end.x} ${end.y}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
            />

            {/* Handle P1 */}
            <circle
              cx={sp1.x} cy={sp1.y} r="4"
              className="fill-black stroke-white stroke-2 cursor-pointer hover:stroke-amber-500 transition-colors"
              onPointerDown={handlePointerDown('p1')}
            />

            {/* Handle P2 */}
            <circle
              cx={sp2.x} cy={sp2.y} r="4"
              className="fill-black stroke-white stroke-2 cursor-pointer hover:stroke-amber-500 transition-colors"
              onPointerDown={handlePointerDown('p2')}
            />

            {/* Start/End Points */}
            <circle cx={start.x} cy={start.y} r="3" fill="white" />
            <circle cx={end.x} cy={end.y} r="3" fill="white" />
          </svg>
        </div>

        <div className="w-full flex justify-center gap-1 mt-6 flex-wrap">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => onChange({ p1: preset.p1, p2: preset.p2 })}
              className={`
                            px-3 py-1 text-[10px] sm:text-xs rounded-full border transition-all
                            ${JSON.stringify(curve.p1) === JSON.stringify(preset.p1) && JSON.stringify(curve.p2) === JSON.stringify(preset.p2)
                  ? 'bg-white text-black border-white font-medium'
                  : 'bg-transparent text-stone-500 border-stone-800 hover:border-stone-600 hover:text-stone-300'}
                        `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>


    </div>
  );
};
