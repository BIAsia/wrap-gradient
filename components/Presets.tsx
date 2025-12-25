import React, { useState } from 'react';
import { THEME } from '../config/theme';
import { ColorStop, InterpolationMode } from '../types';
import gData from '../config/g.json';
import oklchData from '../config/oklch_presets.json';


// Helper to convert normalized RGB from g.json to Hex
const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Process presets from g.json (default OKLAB)
const PRESETS_OKLAB = gData.records.slice(0, 72).map((record, rIdx) => ({
    name: record.name,
    stops: record.gradient.stops.map((stop, sIdx) => ({
        id: `preset-oklab-${rIdx}-${sIdx}`,
        color: rgbToHex(stop.colorData.red, stop.colorData.green, stop.colorData.blue),
        position: stop.location
    })),
    mode: InterpolationMode.OKLAB
}));

// Process presets from oklch_presets.json (default OKLCH)
const PRESETS_OKLCH = oklchData.records.map((record, rIdx) => ({
    name: `OKLCH Preset ${rIdx + 1}`,
    stops: record.stops.map((stop, sIdx) => ({
        id: `preset-oklch-${rIdx}-${sIdx}`,
        color: stop.color,
        position: stop.position
    })),
    mode: InterpolationMode.OKLCH
}));

interface PresetsProps {
    onSelect: (stops: ColorStop[], mode?: InterpolationMode) => void;
}

export const Presets: React.FC<PresetsProps> = ({ onSelect }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const half = Math.ceil(PRESETS_OKLAB.length / 2);
    const row1 = PRESETS_OKLAB.slice(0, half);
    const row2 = PRESETS_OKLAB.slice(half);
    const row3 = PRESETS_OKLCH;

    const handleSelect = (id: string, stops: ColorStop[], mode: InterpolationMode) => {
        setSelectedId(id);
        onSelect(stops, mode);
    };

    const allPresets = [...PRESETS_OKLAB, ...PRESETS_OKLCH];

    const renderRow = (presets: typeof PRESETS_OKLAB) => {
        return presets.map((preset) => {
            const isSelected = selectedId === preset.stops[0].id;
            const gradientStr = preset.stops
                .sort((a, b) => a.position - b.position)
                .map(s => `${s.color} ${s.position * 100}%`)
                .join(', ');

            // Map internal mode to CSS color space identifier
            const cssMode = preset.mode === InterpolationMode.RGB ? 'srgb' : preset.mode;

            return (
                <button
                    key={preset.stops[0].id}
                    onClick={() => handleSelect(preset.stops[0].id, preset.stops, preset.mode)}
                    className={`
                        transition-all duration-500 ease-out relative flex-shrink-0
                        ${isSelected ? 'flex-[4] h-full z-10' : 'flex-1 h-[40%] hover:flex-[1.5] hover:h-[60%] hover:z-20'}
                    `}
                    style={{
                        background: `linear-gradient(in ${cssMode} to top, ${gradientStr})`,
                    }}
                    title={preset.name}
                    aria-label={preset.name}
                >
                    {isSelected && (
                        <div className="absolute inset-0 border-2 border-white pointer-events-none"></div>
                    )}
                </button>
            );
        });
    };

    return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className={`flex items-center justify-between ${THEME.panel.header.padding} shrink-0`}>
                <h2 className={`${THEME.panel.header.title} ${THEME.typography.color.label}`}>Presets</h2>
                <button
                    onClick={() => {
                        const idx = Math.floor(Math.random() * allPresets.length);
                        const preset = allPresets[idx];
                        handleSelect(preset.stops[0].id, preset.stops, preset.mode);
                    }}
                    className={`${THEME.typography.size.xs} ${THEME.typography.color.label} hover:${THEME.typography.color.accent} ${THEME.animation.transition}`}
                >
                    Random
                </button>
            </div>

            {/* Fluid Three Rows Layout */}
            <div className="flex-1 flex flex-col min-h-0 pb-4 px-4 overflow-hidden">
                <div className="flex-1 flex flex-col gap-0 h-full">
                    {/* Row 1 */}
                    <div className="flex-1 flex items-center w-full min-h-0">
                        {renderRow(row1)}
                    </div>
                    {/* Row 2 */}
                    <div className="flex-1 flex items-center w-full min-h-0">
                        {renderRow(row2)}
                    </div>
                    {/* Row 3 - OKLCH Presets */}
                    <div className="flex-1 flex items-center w-full min-h-0">
                        {renderRow(row3)}
                    </div>
                </div>
            </div>
        </div>
    );
};

