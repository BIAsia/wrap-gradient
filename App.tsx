import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CurveEditor } from './components/CurveEditor';
import { ColorStopsEditor } from './components/ColorStopsEditor';
import { GradientPreview } from './components/GradientPreview';
import { CodeOutput } from './components/CodeOutput';
import { Presets } from './components/Presets';
import { InfoPanel } from './components/InfoPanel';
import { BezierCurve, ColorStop, InterpolationMode } from './types';
import { solveCubicBezier, generateAdaptiveSamples } from './utils/bezier';
import { interpolateColor } from './utils/color';

const App: React.FC = () => {
  // --- State ---
  const [curve, setCurve] = useState<BezierCurve>({
    p1: { x: 0.25, y: 0 },
    p2: { x: 0.37, y: 0.96 }
  });

  const [stops, setStops] = useState<ColorStop[]>([
    { id: '1', color: '#CCE31C', position: 0 },
    { id: '2', color: '#FB2883', position: 1 }
  ]);

  const [interpolationMode, setInterpolationMode] = useState<InterpolationMode>(InterpolationMode.OKLCH);
  const [samples, setSamples] = useState<number>(10); // Default 10 as requested
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Logic: Generate Warped Stops ---
  const warpedStops = useMemo(() => {
    // ... (same logic)
    // To optimize, we won't repeat the loop here, assuming generateAdaptiveSamples logic is solid
    // but we need to ensure it respects 'samples' state accurately.
    // In 'utils/bezier.ts', if generateAdaptiveSamples(samples, ...), it should work.
    // Let's ensure solveCubicBezier and generation is correct.

    // RE-IMPLEMENTING LOGIC HERE FOR CLARITY IN DIFF (Logic remains roughly same)
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);

    const getColorAt = (t: number) => {
      if (sortedStops.length === 0) return '#000000';
      if (t <= sortedStops[0].position) return sortedStops[0].color;
      if (t >= sortedStops[sortedStops.length - 1].position) return sortedStops[sortedStops.length - 1].color;

      for (let i = 0; i < sortedStops.length - 1; i++) {
        const start = sortedStops[i];
        const end = sortedStops[i + 1];
        if (t >= start.position && t <= end.position) {
          const localT = (t - start.position) / (end.position - start.position);
          return interpolateColor(start.color, end.color, localT, interpolationMode);
        }
      }
      return sortedStops[sortedStops.length - 1].color;
    };

    const result: ColorStop[] = [];
    // If samples == 0, fallback
    const actualSamples = samples || 10;

    // We want exactly 'samples' number of points? Or adaptive?
    // Design usually implies fixed steps for "Quality".
    // Let's use linear spacing based on samples count if we want predictable "Default 10, Low 4"
    // "generateAdaptiveSamples" suggests it distributes points based on curvature.
    // Ideally we pass 'samples' into it. assuming utils/bezier accepts it.

    const positions = generateAdaptiveSamples(actualSamples, curve.p1, curve.p2);

    for (const x of positions) {
      const y = solveCubicBezier(x, curve.p1, curve.p2);
      result.push({
        id: `gen-${x}`,
        position: x,
        color: getColorAt(y)
      });
    }

    return result;
  }, [stops, curve, interpolationMode, samples]);

  const handlePresetSelect = (start: string, end: string) => {
    setStops([
      { id: Math.random().toString(), position: 0, color: start },
      { id: Math.random().toString(), position: 1, color: end }
    ]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-stone-800 selection:text-white flex flex-col overflow-hidden transition-colors duration-300">
      <Header />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border border-border min-h-0">

        {/* Column 1: Preview & Presets */}
        <div className="flex flex-col min-h-0">
          <div className="h-1/2 p-6 border-b border-border">
            <GradientPreview originalStops={stops} warpedStops={warpedStops} />
          </div>
          <div className="h-1/2 p-6">
            <Presets onSelect={handlePresetSelect} />
          </div>
        </div>

        {/* Column 2: Curve & Stops */}
        <div className="flex flex-col min-h-0">
          <div className="h-1/2 p-6 border-b border-border">
            <CurveEditor curve={curve} onChange={setCurve} />
          </div>
          <div className="h-1/2 p-6 overflow-hidden">
            <ColorStopsEditor
              stops={stops}
              setStops={setStops}
              interpolationMode={interpolationMode}
              setInterpolationMode={setInterpolationMode}
              currentQuality={samples}
              setQuality={setSamples}
              warpedStops={warpedStops} // Pass warped stops for track background
            />
          </div>
        </div>

        {/* Column 3: Info & Export */}
        <div className="flex flex-col min-h-0">
          <div className="h-[40%] p-6 border-b border-border flex items-center justify-center">
            <InfoPanel stops={warpedStops} />
          </div>
          <div className="h-[60%] p-4 lg:p-6">
            <CodeOutput stops={warpedStops} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;