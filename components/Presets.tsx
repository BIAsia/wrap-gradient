import React, { useEffect, useMemo, useState } from 'react';
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

type PresetItem = {
    name: string;
    stops: ColorStop[];
    mode: InterpolationMode;
};

type PresetFamily = 'oklch' | 'oklab';

const FEATURED_COUNT = 12;

interface PresetsProps {
    onSelect: (stops: ColorStop[], mode?: InterpolationMode) => void;
}

export const Presets: React.FC<PresetsProps> = ({ onSelect }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [family, setFamily] = useState<PresetFamily>('oklch');
    const [isAllOpen, setIsAllOpen] = useState(false);

    const presetsByFamily = useMemo(() => ({
        oklch: PRESETS_OKLCH,
        oklab: PRESETS_OKLAB,
    }), []);

    const activePresets = presetsByFamily[family];
    const featuredPresets = activePresets.slice(0, FEATURED_COUNT);
    const allPresetGroups = [
        { key: 'oklch', title: 'OKLCH', presets: PRESETS_OKLCH },
        { key: 'oklab', title: 'OKLAB', presets: PRESETS_OKLAB },
    ] as const;

    useEffect(() => {
        if (!isAllOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isAllOpen]);

    const handleSelect = (id: string, stops: ColorStop[], mode: InterpolationMode) => {
        setSelectedId(id);
        onSelect(stops, mode);
    };

    const handleRandom = () => {
        const allPresets = [...PRESETS_OKLAB, ...PRESETS_OKLCH];
        const preset = allPresets[Math.floor(Math.random() * allPresets.length)];
        setFamily(preset.mode === InterpolationMode.OKLAB ? 'oklab' : 'oklch');
        handleSelect(preset.stops[0].id, preset.stops, preset.mode);
    };

    const renderRow = (presets: PresetItem[]) => {
        return presets.map((preset) => {
            const isSelected = selectedId === preset.stops[0].id;
            const gradientStr = [...preset.stops]
                .sort((a, b) => a.position - b.position)
                .map(s => `${s.color} ${s.position * 100}%`)
                .join(', ');

            const cssMode = preset.mode === InterpolationMode.RGB ? 'srgb' : preset.mode;

            return (
                <button
                    key={preset.stops[0].id}
                    onClick={() => handleSelect(preset.stops[0].id, preset.stops, preset.mode)}
                    className={`
                        transition-all duration-500 ease-out relative flex-shrink-0
                        ${isSelected ? 'flex-[4] h-[80%] z-10' : 'flex-1 h-[40%] hover:flex-[1.5] hover:h-[60%] hover:z-20'}
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
        <>
            <div className="h-full flex flex-col min-h-0 overflow-hidden">
                <div className={`flex items-center justify-between ${THEME.panel.header.padding} shrink-0`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className={`${THEME.panel.header.title} ${THEME.typography.color.label}`}>Presets</h2>
                        <div className="flex items-center bg-muted rounded-full p-0.5 border border-border">
                            {[
                                { id: 'oklch', label: 'OKLCH' },
                                { id: 'oklab', label: 'OKLAB' },
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setFamily(option.id as PresetFamily)}
                                    className={`px-3 py-1 text-[10px] font-medium rounded-full transition-colors whitespace-nowrap ${family === option.id
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <button
                            onClick={() => setIsAllOpen(true)}
                            className={`${THEME.typography.size.xs} ${THEME.typography.color.label} hover:${THEME.typography.color.accent} ${THEME.animation.transition}`}
                        >
                            All
                        </button>
                        <button
                            onClick={handleRandom}
                            className={`${THEME.typography.size.xs} ${THEME.typography.color.label} hover:${THEME.typography.color.accent} ${THEME.animation.transition}`}
                        >
                            Random
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 pb-4 px-4 overflow-hidden">
                    <div className="flex-1 flex flex-col gap-0 h-full">
                        <div className="flex-1 flex items-center w-full min-h-0">
                            {renderRow(featuredPresets)}
                        </div>
                    </div>
                </div>
            </div>

            {isAllOpen && (
                <div className="fixed inset-0 z-50 bg-black">
                    <div className="h-full flex flex-col min-h-0">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                            <h2 className="text-sm font-medium tracking-wide text-white uppercase">
                                All presets
                            </h2>
                            <button
                                onClick={() => setIsAllOpen(false)}
                                className="text-xs text-white/70 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-8">
                            {allPresetGroups.map((group) => (
                                <section key={group.key} className="space-y-4">
                                    <h3 className="text-xs font-medium tracking-wide text-white/70 uppercase">
                                        {group.title}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-full">
                                        {group.presets.map((preset, index) => {
                                            const isSelected = selectedId === preset.stops[0].id;
                                            const gradientStr = [...preset.stops]
                                                .sort((a, b) => a.position - b.position)
                                                .map(s => `${s.color} ${s.position * 100}%`)
                                                .join(', ');

                                            const cssMode = preset.mode === InterpolationMode.OKLAB
                                                ? 'oklab'
                                                : preset.mode === InterpolationMode.OKLCH
                                                    ? 'oklch'
                                                    : 'srgb';
                                            const displayName = preset.name || `${preset.mode.toUpperCase()} ${index + 1}`;

                                            return (
                                                <button
                                                    key={preset.stops[0].id}
                                                    onClick={() => {
                                                        handleSelect(preset.stops[0].id, preset.stops, preset.mode);
                                                        setIsAllOpen(false);
                                                    }}
                                                    className="block text-left"
                                                    title={displayName}
                                                    aria-label={displayName}
                                                >
                                                    <div className="relative aspect-[3/4] overflow-hidden"
                                                        style={{
                                                            background: `linear-gradient(in ${cssMode} to top, ${gradientStr})`,
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute inset-0 border-2 border-white pointer-events-none"></div>
                                                        )}
                                                    </div>
                                                    <div className="bg-black px-3 py-3">
                                                        <div className="text-[10px] text-white/60 uppercase tracking-[0.16em] mb-1">
                                                            {group.title}
                                                        </div>
                                                        <div className="text-xs text-white/90 leading-snug break-words">
                                                            {displayName}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
