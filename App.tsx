import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { About } from './components/About';
import { CurveEditor } from './components/CurveEditor';
import { ColorStopsEditor } from './components/ColorStopsEditor';
import { GradientPreview } from './components/GradientPreview';
import { CodeOutput } from './components/CodeOutput';
import { Presets } from './components/Presets';
import { InfoPanel } from './components/InfoPanel';
import { BezierCurve, ColorStop, InterpolationMode } from './types';
import { solveCubicBezier, generateAdaptiveSamples } from './utils/bezier';
import { interpolateColor } from './utils/color';

import { THEME } from './config/theme';

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
  const [view, setView] = useState<'editor' | 'about'>('editor');

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

    // Strategy: Unified Adaptive sampling with Curve support for all modes except maybe future ones
    // We now include RGB, OKLAB, OKLCH, and LCH
    const result: ColorStop[] = [];
    const actualSamples = samples || 10;
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

  const handlePresetSelect = (newStops: ColorStop[], mode?: InterpolationMode) => {
    setStops(newStops);
    if (mode === InterpolationMode.OKLAB) {
      setInterpolationMode(mode);
      setCurve({ p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } });
    } else if (mode === InterpolationMode.OKLCH) {
      setInterpolationMode(mode);
      setCurve({ p1: { x: 0.42, y: 0 }, p2: { x: 1, y: 1 } });
    } else if (mode) {
      setInterpolationMode(mode);
    }
  };

  return (
    <div className={`min-h-screen ${THEME.typography.color.primary} font-sans selection:bg-primary selection:text-primary-foreground flex flex-col overflow-hidden ${THEME.animation.transition} ${THEME.animation.duration} bg-background`}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={view}
        onViewChange={setView}
      />

      {view === 'editor' ? (
        <main className={`flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${THEME.layout.divide} ${THEME.layout.border} border-t min-h-0`}>

          {/* Column 1: Preview & Presets */}
          <div className="flex flex-col min-h-0">
            <div className={`h-1/2 ${THEME.layout.padding.standard} ${THEME.panel.sectionBorder}`}>
              <GradientPreview originalStops={stops} warpedStops={warpedStops} />
            </div>
            <div className={`h-1/2 ${THEME.layout.padding.standard}`}>
              <Presets onSelect={handlePresetSelect} />
            </div>
          </div>

          {/* Column 2: Curve & Stops */}
          <div className="flex flex-col min-h-0">
            <div className={`h-1/2 ${THEME.layout.padding.standard} ${THEME.panel.sectionBorder}`}>
              <CurveEditor curve={curve} onChange={setCurve} />
            </div>
            <div className={`h-1/2 ${THEME.layout.padding.standard} overflow-hidden`}>
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
            <div className={`h-[40%] ${THEME.layout.padding.standard} ${THEME.panel.sectionBorder} flex items-center justify-center`}>
              <InfoPanel
                warpedStops={warpedStops}
                interpolationMode={interpolationMode}
                originalStops={stops}
                curve={curve}
              />
            </div>
            <div className={`h-[60%] ${THEME.layout.padding.compact} sm:${THEME.layout.padding.standard}`}>
              <CodeOutput stops={warpedStops} />
            </div>
          </div>

        </main>
      ) : (
        <main className="flex-1 flex flex-col min-h-0 border-t border-border bg-background">
          <About />
        </main>
      )}
    </div>
  );
};

export default App;