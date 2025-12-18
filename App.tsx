import React, { useState, useEffect, useMemo } from 'react';
import { CurveEditor } from './components/CurveEditor';
import { ColorStopsEditor } from './components/ColorStopsEditor';
import { GradientPreview } from './components/GradientPreview';
import { CodeOutput } from './components/CodeOutput';
import { BezierCurve, ColorStop, InterpolationMode } from './types';
import { solveCubicBezier, generateAdaptiveSamples } from './utils/bezier';
import { interpolateColor } from './utils/color';
import { Settings2, Github, Share2 } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [curve, setCurve] = useState<BezierCurve>({
    p1: { x: 0.42, y: 0 },
    p2: { x: 0.58, y: 1 }
  }); // Ease-in-out default

  const [stops, setStops] = useState<ColorStop[]>([
    { id: '1', color: '#fb2380', position: 0 },
    { id: '2', color: '#28e2fb', position: 1 }
  ]);

  const [interpolationMode, setInterpolationMode] = useState<InterpolationMode>(InterpolationMode.OKLCH);
  const [samples, setSamples] = useState<number>(16);

  // --- Logic: Generate Warped Stops ---
  const warpedStops = useMemo(() => {
    // 1. Sort base stops
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    
    // 2. Helper to get color at a specific "color-progress" t (0-1)
    const getColorAt = (t: number) => {
       if (sortedStops.length === 0) return '#000000';

       // Handle cases where t is outside the range of defined stops
       // (e.g. if the first stop is at 0.4, t=0.1 should return the first stop's color)
       if (t <= sortedStops[0].position) {
         return sortedStops[0].color;
       }
       if (t >= sortedStops[sortedStops.length - 1].position) {
         return sortedStops[sortedStops.length - 1].color;
       }
       
       // find segment
       for (let i = 0; i < sortedStops.length - 1; i++) {
         const start = sortedStops[i];
         const end = sortedStops[i+1];
         if (t >= start.position && t <= end.position) {
            // Local t within this segment
            const localT = (t - start.position) / (end.position - start.position);
            return interpolateColor(start.color, end.color, localT, interpolationMode);
         }
       }
       return sortedStops[sortedStops.length-1].color;
    };

    // 3. Generate intermediate stops with adaptive sampling
    const result: ColorStop[] = [];
    
    // Get adaptive sample positions based on curve's rate of change
    const samplePositions = generateAdaptiveSamples(samples, curve.p1, curve.p2);
    
    for (let i = 0; i < samplePositions.length; i++) {
        // x is the spatial position in the resulting gradient
        const x = samplePositions[i];
        
        // y is the "time" or "color progression" value derived from the bezier easing
        // solveCubicBezier(x) returns the Y value at X
        const y = solveCubicBezier(x, curve.p1, curve.p2);
        
        result.push({
            id: `gen-${i}`,
            position: x,
            color: getColorAt(y)
        });
    }
    
    return result;

  }, [stops, curve, interpolationMode, samples]);


  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-stone-900 rounded-md"></div>
            <h1 className="font-bold text-lg tracking-tight">WarpGradient</h1>
          </div>
          <div className="flex items-center gap-4">
             <a href="#" className="text-stone-500 hover:text-stone-900 transition-colors">
                 <Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="sm:col-span-4 space-y-6">
            
            {/* Curve Editor Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-amber-500" />
                        Easing Curve
                    </h2>
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-500 font-mono">
                        cubic-bezier({curve.p1.x.toFixed(2)}, {curve.p1.y.toFixed(2)}, {curve.p2.x.toFixed(2)}, {curve.p2.y.toFixed(2)})
                    </span>
                </div>
                <CurveEditor curve={curve} onChange={setCurve} />
            </div>

            {/* Stops Editor Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-100">
                <h2 className="text-sm font-bold text-stone-900 mb-4">Gradient Stops</h2>
                <ColorStopsEditor stops={stops} setStops={setStops} />
            </div>

            {/* Settings Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 space-y-4">
                 <h2 className="text-sm font-bold text-stone-900 mb-2">Configuration</h2>
                 
                 <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Color Interpolation</label>
                    <div className="flex rounded-md shadow-sm" role="group">
                        {[InterpolationMode.RGB, InterpolationMode.OKLCH, InterpolationMode.OKLAB].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setInterpolationMode(mode)}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium border first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 transition-colors
                                    ${interpolationMode === mode 
                                        ? 'bg-stone-900 text-white border-stone-900 z-10' 
                                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                            >
                                {mode.toUpperCase()}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                        Output Samples: <span className="text-stone-900">{samples}</span>
                    </label>
                    <input 
                        type="range" 
                        min="4" max="64" step="1"
                        value={samples} 
                        onChange={(e) => setSamples(Number(e.target.value))}
                        className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                    />
                 </div>
            </div>

        </div>

        {/* Right Column: Preview & Output */}
        <div className="sm:col-span-8 space-y-6">
            
            {/* Preview Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <GradientPreview originalStops={stops} warpedStops={warpedStops} />
            </div>

            {/* Code Output Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col h-[400px]">
                <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center justify-between">
                    <span>Generated Code</span>
                    <span className="text-xs font-normal text-stone-400">Ready for production</span>
                </h2>
                <CodeOutput stops={warpedStops} />
            </div>

        </div>

      </main>
    </div>
  );
};

export default App;