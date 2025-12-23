import React, { useState } from 'react';

// Hardcoded presets for now
const PRESETS = [
    { start: '#fb2380', end: '#28e2fb' },
    { start: '#ff9a9e', end: '#fecfef' },
    { start: '#a18cd1', end: '#fbc2eb' },
    { start: '#84fab0', end: '#8fd3f4' },
    { start: '#e0c3fc', end: '#8ec5fc' },
    { start: '#f093fb', end: '#f5576c' },
    { start: '#4facfe', end: '#00f2fe' },
    { start: '#43e97b', end: '#38f9d7' },
    { start: '#fa709a', end: '#fee140' },
    { start: '#30cfd0', end: '#330867' },
];

export const Presets: React.FC<{ onSelect: (start: string, end: string) => void }> = ({ onSelect }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleSelect = (idx: number, start: string, end: string) => {
        setSelectedIndex(idx);
        onSelect(start, end);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                {/* Presets Title with Random button aligned */}
                <h2 className="text-sm text-stone-500 font-medium">Presets</h2>
                <button
                    onClick={() => {
                        const idx = Math.floor(Math.random() * PRESETS.length);
                        const random = PRESETS[idx];
                        handleSelect(idx, random.start, random.end);
                    }}
                    className="text-xs text-stone-500 hover:text-white transition-colors"
                >
                    Random
                </button>
            </div>

            {/* Preset Strip */}
            <div className="flex h-32 w-full">
                {PRESETS.map((preset, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx, preset.start, preset.end)}
                            className={`
                            h-full transition-all duration-500 ease-out relative
                            ${isSelected ? 'w-[40%] z-10' : 'flex-1 hover:w-[15%]'}
                        `}
                            style={{
                                background: `linear-gradient(to top, ${preset.start}, ${preset.end})`,
                                // Ensure borders don't separate them visually
                            }}
                            aria-label={`Select preset ${idx + 1}`}
                        >
                            {/* Optional: Add a white border or indicator if selected */}
                            {isSelected && (
                                <div className="absolute inset-0 border-2 border-white pointer-events-none mix-blend-overlay"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
