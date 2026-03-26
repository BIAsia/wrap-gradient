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

const getCssMode = (mode: InterpolationMode) => mode === InterpolationMode.RGB ? 'srgb' : mode;

const getGradientBackground = (preset: PresetItem) => {
    const gradientStr = [...preset.stops]
        .sort((a, b) => a.position - b.position)
        .map(s => `${s.color} ${s.position * 100}%`)
        .join(', ');

    return `linear-gradient(in ${getCssMode(preset.mode)} to top, ${gradientStr})`;
};

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

    const renderFeaturedPreset = (preset: PresetItem) => {
        const id = preset.stops[0].id;
        const isSelected = selectedId === id;

        return (
            <button
                key={id}
                onClick={() => handleSelect(id, preset.stops, preset.mode)}
                className={`
                    relative flex-shrink-0 transition-all duration-500 ease-out rounded-[1rem] overflow-hidden
                    ${isSelected
                        ? 'flex-[4] h-[82%] z-10 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.55)]'
                        : 'flex-1 h-[42%] hover:flex-[1.5] hover:h-[60%] hover:z-20'}
                `}
                style={{ background: getGradientBackground(preset) }}
                title={preset.name}
                aria-label={preset.name}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {isSelected && (
                    <div className="absolute inset-0 rounded-[1rem] border border-white/80 pointer-events-none"></div>
                )}
            </button>
        );
    };

    const renderAllPresetCard = (preset: PresetItem, index: number) => {
        const id = preset.stops[0].id;
        const isSelected = selectedId === id;

        return (
            <button
                key={id}
                onClick={() => {
                    handleSelect(id, preset.stops, preset.mode);
                    setIsAllOpen(false);
                }}
                className={`group relative aspect-[5/4] overflow-hidden rounded-2xl border text-left transition-all duration-300 ${isSelected
                    ? 'border-white/80 shadow-[0_18px_50px_-30px_rgba(255,255,255,0.55)] scale-[0.985]'
                    : 'border-white/10 hover:border-white/35 hover:-translate-y-0.5'
                    }`}
                style={{ background: getGradientBackground(preset) }}
                title={preset.name}
                aria-label={preset.name}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/65 mb-1">
                            {preset.mode.toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-white truncate">
                            {preset.name || `${preset.mode.toUpperCase()} ${index + 1}`}
                        </div>
                    </div>
                    {isSelected && (
                        <div className="rounded-full border border-white/30 bg-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                            Active
                        </div>
                    )}
                </div>
            </button>
        );
    };

    return (
        <>
            <div className="h-full flex flex-col min-h-0 overflow-hidden">
                <div className={`flex items-center justify-between ${THEME.panel.header.padding} shrink-0 gap-3`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className={`${THEME.panel.header.title} ${THEME.typography.color.label} shrink-0`}>Presets</h2>
                        <div className="flex items-center bg-muted rounded-full p-0.5 border border-border min-w-0">
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

                    <div className="flex items-center gap-2 shrink-0">
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

                <div className="px-4 pb-2">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        Featured {family.toUpperCase()} presets
                    </p>
                </div>

                <div className="flex-1 flex flex-col min-h-0 pb-4 px-4 overflow-hidden">
                    <div className="flex-1 flex items-center gap-2 w-full min-h-0">
                        {featuredPresets.map(renderFeaturedPreset)}
                    </div>
                </div>
            </div>

            {isAllOpen && (
                <div className="fixed inset-0 z-50 bg-black/88 backdrop-blur-xl">
                    <div className="h-full w-full flex flex-col text-white">
                        <div className="flex items-start justify-between gap-6 px-6 py-5 border-b border-white/10">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.3em] text-white/55 mb-2">
                                    Gradient library
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight">
                                    All {family.toUpperCase()} presets
                                </h3>
                                <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                                    Browse the full preset collection, inspect the mood of each gradient, and apply one directly to the editor.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                                    {[
                                        { id: 'oklch', label: 'OKLCH' },
                                        { id: 'oklab', label: 'OKLAB' },
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setFamily(option.id as PresetFamily)}
                                            className={`px-3 py-1.5 text-[11px] rounded-full transition-colors ${family === option.id
                                                ? 'bg-white text-black'
                                                : 'text-white/65 hover:text-white'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsAllOpen(false)}
                                    className="h-10 w-10 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/35 transition-colors"
                                    aria-label="Close preset library"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {activePresets.map(renderAllPresetCard)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
