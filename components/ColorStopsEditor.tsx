import React, { useRef, useMemo, useState, useEffect } from 'react';
import { ColorStop, InterpolationMode } from '../types';
import { THEME } from '../config/theme';

interface ColorStopsEditorProps {
  stops: ColorStop[];
  setStops: (stops: ColorStop[]) => void;
  interpolationMode: InterpolationMode;
  setInterpolationMode: (mode: InterpolationMode) => void;
  currentQuality: number;
  setQuality: (q: number) => void;
  warpedStops: ColorStop[];
}

export const ColorStopsEditor: React.FC<ColorStopsEditorProps> = ({
  stops,
  setStops,
  interpolationMode,
  setInterpolationMode,
  currentQuality,
  setQuality,
  warpedStops
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isQualityOpen, setIsQualityOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQualityOpen(false);
      }
    };
    if (isQualityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQualityOpen]);

  const addStop = () => {
    // Add a new stop at a reasonable position
    const newPos = stops.length > 0 ? (stops[stops.length - 1].position + 0.1) % 1 : 0.5;

    const newStop = {
      id: Math.random().toString(36).substr(2, 9),
      position: Math.min(0.95, newPos),
      color: stops.length > 0 ? stops[stops.length - 1].color : '#CCE31C'
    };
    setStops([...stops, newStop].sort((a, b) => a.position - b.position));
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter(s => s.id !== id));
  };

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Use warpedStops to generate the visual track gradient so it matches the final output 1:1
  const trackGradient = useMemo(() => {
    if (warpedStops.length < 2) return '';
    // Create a linear gradient using the warped stops directly
    return `linear-gradient(to right, ${warpedStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`;
  }, [warpedStops]);

  // Handle Drag Logic
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const stop = stops.find(s => s.id === id);
    if (!stop || !containerRef.current) return;
    const startPos = stop.position;
    const rect = containerRef.current.getBoundingClientRect();

    const onMove = (mv: MouseEvent) => {
      const deltaX = mv.clientX - startX;
      const effectiveWidth = rect.width - 24;
      const deltaP = deltaX / effectiveWidth;
      let newP = Math.max(0, Math.min(1, startPos + deltaP));
      updateStop(id, { position: newP });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const sorted = [...stops].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between mb-2`}>
        <h2 className={`${THEME.panel.header.title} ${THEME.typography.color.label}`}>Key stops</h2>
        <button className={`${THEME.typography.size.xs} ${THEME.typography.color.label} hover:${THEME.typography.color.accent} transition-colors cursor-not-allowed opacity-50`}>Import from pasteboard</button>
      </div>

      {/* Interpolation Mode Selector */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center bg-stone-900 rounded-full p-0.5 border border-stone-800">
          {[InterpolationMode.OKLCH, InterpolationMode.OKLAB, InterpolationMode.RGB].map(mode => (
            <button
              key={mode}
              onClick={() => setInterpolationMode(mode)}
              className={`px-3 py-1 text-[10px] font-medium rounded-full transition-colors uppercase
                            ${interpolationMode === mode ? 'bg-white text-black' : 'text-stone-500 hover:text-stone-300'}`}
            >
              {mode === 'lch' ? 'LCH' : mode}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Quality</span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => interpolationMode !== InterpolationMode.RGB && setIsQualityOpen(!isQualityOpen)}
              className={`px-2 py-1 text-[10px] rounded-full font-medium flex items-center gap-1 transition-all
                            ${interpolationMode === InterpolationMode.RGB
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-stone-100 active:scale-95'}`}
            >
              {interpolationMode === InterpolationMode.RGB ? 'Origin' : (currentQuality === 10 ? 'Default' : currentQuality === 4 ? 'Low' : 'High')}
              {interpolationMode !== InterpolationMode.RGB && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform duration-200 ${isQualityOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 top-full mt-1 bg-stone-900 border border-stone-800 rounded-lg p-1 shadow-xl z-20 w-32 origin-top-right transition-all duration-200 
                            ${isQualityOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
            >
              {[
                { label: interpolationMode === InterpolationMode.OKLAB ? 'Low (Min 4)' : 'Low (4)', value: 4 },
                { label: interpolationMode === InterpolationMode.OKLAB ? 'Default (Max 10)' : 'Default (10)', value: 10 },
                { label: interpolationMode === InterpolationMode.OKLAB ? 'High (Max 16)' : 'High (16)', value: 16 }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setQuality(opt.value);
                    setIsQualityOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-[10px] rounded hover:bg-stone-800 transition-colors flex items-center justify-between
                                        ${currentQuality === opt.value ? 'text-white bg-stone-800/50' : 'text-stone-400'}`}
                >
                  {opt.label}
                  {currentQuality === opt.value && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Slider Track */}
      <div className="relative h-16 mb-8 group select-none px-3" ref={containerRef}>
        <div
          className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-10 rounded-xl group-hover:border-white/20 transition-colors overflow-hidden"
          style={{ background: trackGradient }}
        ></div>

        {stops.map((stop) => (
          <div
            key={stop.id}
            className="absolute top-0 bottom-0 w-6 -ml-3 flex flex-col items-center justify-center cursor-ew-resize z-10 group/handle"
            style={{ left: `calc(12px + ${stop.position * 100}% - ${stop.position * 24}px)` }}
            onMouseDown={(e) => handleMouseDown(e, stop.id)}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute inset-0 bg-white rounded-full shadow-lg transform group-hover/handle:scale-110 transition-transform duration-200"></div>
              <div
                className="absolute inset-[3px] rounded-full shadow-inner transform group-hover/handle:scale-110 transition-transform duration-200"
                style={{ backgroundColor: stop.color }}
              ></div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 w-[1px] h-10 bg-white/20 mix-blend-overlay pointer-events-none group-hover/handle:bg-white/40"></div>
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[100px]">
        {sorted.map(stop => (
          <div key={stop.id} className="flex items-center gap-4 text-xs font-mono group hover:bg-white/5 p-1 rounded transition-colors">
            <div className="w-12 text-stone-400">{(stop.position * 100).toFixed(0)}%</div>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div
                  className="w-5 h-5 rounded-md shadow-sm ring-1 ring-white/20 hover:ring-white/40 transition-all cursor-pointer"
                  style={{ backgroundColor: stop.color }}
                ></div>
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={stop.color.toUpperCase()}
                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="bg-transparent text-stone-300 outline-none w-20 uppercase font-medium"
              />
            </div>
            <div className="text-right text-stone-500 font-medium bg-stone-900 px-2 py-0.5 rounded text-[10px]">
              STOP {(stop.position * 100).toFixed(0)}
            </div>
            <button
              onClick={() => removeStop(stop.id)}
              className={`text-stone-600 hover:text-stone-300 transition-colors ${stops.length <= 2 ? 'invisible' : ''}`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addStop}
        className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs font-medium rounded-lg transition-colors border border-stone-800 self-end mt-auto"
      >
        Add new stop
      </button>

    </div>
  );
};
