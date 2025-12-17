import React, { useMemo } from 'react';
import { ColorStop } from '../types';

interface GradientPreviewProps {
  originalStops: ColorStop[];
  warpedStops: ColorStop[];
}

export const GradientPreview: React.FC<GradientPreviewProps> = ({ originalStops, warpedStops }) => {
  
  const getGradientString = (stops: ColorStop[]) => {
    return `linear-gradient(90deg, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`;
  };

  const originalGradient = useMemo(() => getGradientString(originalStops), [originalStops]);
  const warpedGradient = useMemo(() => getGradientString(warpedStops), [warpedStops]);

  return (
    <div className="space-y-6">
       <div>
         <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">Standard Linear</label>
         <div className="h-16 w-full rounded-lg border border-stone-200 shadow-sm" style={{ background: originalGradient }} />
       </div>
       
       <div>
         <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 flex justify-between">
            <span>Pre-warped (Easing Applied)</span>
            <span className="normal-case font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]">{warpedStops.length} stops generated</span>
         </label>
         <div className="h-16 w-full rounded-lg border border-stone-200 shadow-sm relative overflow-hidden" style={{ background: warpedGradient }}>
            {/* Visual indicator of density */}
            <div className="absolute bottom-0 left-0 right-0 h-1 flex opacity-50">
                 {warpedStops.map((stop, i) => (
                     <div 
                        key={i} 
                        className="w-px h-full bg-white/50" 
                        style={{ position: 'absolute', left: `${stop.position * 100}%` }} 
                     />
                 ))}
            </div>
         </div>
       </div>
    </div>
  );
};
