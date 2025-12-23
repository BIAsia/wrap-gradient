import React, { useMemo } from 'react';
import { ColorStop } from '../types';

interface GradientPreviewProps {
  originalStops: ColorStop[];
  warpedStops: ColorStop[];
}

export const GradientPreview: React.FC<GradientPreviewProps> = ({ originalStops, warpedStops }) => {

  const getGradientString = (stops: ColorStop[]) => {
    return `linear-gradient(to top, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`;
  };

  const gradient = useMemo(() => getGradientString(warpedStops), [warpedStops, getGradientString]);

  // Shapes for the preview: Two arches
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-stone-500 font-medium">Preview</h2>
        <button className="text-xs text-stone-500 hover:text-white transition-colors">Change</button>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden bg-black flex items-center justify-center p-8 min-h-[300px]">
        {/* Arches Container */}
        <div className="flex items-end justify-center gap-0 w-full max-w-md h-full">
          {/* Left Arch (Lower) */}
          <div
            className="w-2/3 h-2/3 rounded-t-full z-10"
            style={{ background: gradient }}
          ></div>

          {/* Right Arch (Higher) */}
          <div
            className="w-2/3 h-full rounded-t-full -ml-8"
            style={{ background: gradient }}
          ></div>
        </div>
      </div>
    </div>
  );
};
