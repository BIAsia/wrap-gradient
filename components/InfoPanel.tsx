import React from 'react';
import { ColorStop } from '../types';
import { THEME } from '../config/theme';

interface InfoPanelProps {
    stops?: ColorStop[];
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ stops }) => {
    // Generate gradient string from passed stops or default
    const gradient = stops
        ? `linear-gradient(90deg, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
        : 'linear-gradient(90deg, #FAFA55 0%, #FA8D46 30%, #FA5569 60%, #FA46A3 100%)';

    return (
        <div className={`${THEME.layout.padding.relaxed} flex flex-col items-center justify-center border-r-0 lg:border-r border-transparent`}>
            <h2 className={`${THEME.typography.size.xl} font-bold leading-none mb-6 italic tracking-tight`}
                style={{
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                OKLCH
            </h2>
            <p className={`${THEME.typography.color.secondary} ${THEME.typography.size.sm} max-w-xs text-center leading-relaxed`}>
                offers perceptual uniformity with intuitive lightness, chroma, and hue controls, making color adjustments predictable and designer-friendly.
            </p>
        </div>
    );
};
