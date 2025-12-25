import React, { useMemo, useState } from 'react';
import { ColorStop } from '../types';
import { THEME } from '../config/theme';

interface GradientPreviewProps {
    originalStops: ColorStop[];
    warpedStops: ColorStop[];
}

export const GradientPreview: React.FC<GradientPreviewProps> = ({ originalStops, warpedStops }) => {
    const [previewType, setPreviewType] = useState(0);

    const getGradientString = (stops: ColorStop[], direction: string = 'to top') => {
        return `linear-gradient(${direction}, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`;
    };

    const gradient = useMemo(() => getGradientString(warpedStops), [warpedStops]);
    const gradientDown = useMemo(() => getGradientString(warpedStops, 'to bottom'), [warpedStops]);

    const changePreview = () => {
        setPreviewType((prev) => (prev + 1) % 5);
    };

    const renderPreview = () => {
        // We use a viewBox-like technique with percentage-based sizing and scaling
        // to ensure shapes fill the container while maintaining their relative positions.
        const containerInner = "relative w-full aspect-[4/3] flex items-center justify-center";

        // Helper for gradient border
        const gradientBorderStyle = (thickness: string) => ({
            background: `linear-gradient(black, black) padding-box, ${gradient} border-box`,
            border: `${thickness} solid transparent`,
            borderRadius: '9999px'
        });

        switch (previewType) {
            case 1: // Bars (Frame 37)
                return (
                    <div className="w-full h-full max-w-[500px] flex items-center justify-center">
                        <div className="relative w-full aspect-[450/256]">
                            <div style={{ width: '13.1%', height: '100%', left: '0%', top: '0%', position: 'absolute', background: gradient }} />
                            <div style={{ width: '23.8%', height: '100%', left: '52.4%', top: '0%', position: 'absolute', background: gradient }} />
                            <div style={{ width: '13.1%', height: '100%', left: '13.1%', top: '0%', position: 'absolute', background: gradientDown }} />
                            <div style={{ width: '26.2%', height: '50%', left: '26.2%', top: '50%', position: 'absolute', background: warpedStops[0]?.color }} />
                            <div style={{ width: '26.2%', height: '50%', left: '26.2%', top: '0%', position: 'absolute', background: warpedStops[warpedStops.length - 1]?.color }} />
                            <div style={{ width: '23.8%', height: '100%', left: '76.2%', top: '0%', position: 'absolute', background: gradientDown }} />
                        </div>
                    </div>
                );
            case 2: // Rectangles (Frame 36)
                return (
                    <div className="w-full h-full max-w-[400px] flex items-center justify-center">
                        <div className="relative w-full aspect-[3/4] scale-90">
                            <div style={{ width: '33.3%', height: '54.2%', left: '30.5%', top: '73.8%', position: 'absolute', transform: 'rotate(173deg)', transformOrigin: 'top left', background: gradientDown }} />
                            <div style={{ width: '33.3%', height: '54.2%', left: '43.1%', top: '76.8%', position: 'absolute', transform: 'rotate(-95deg)', transformOrigin: 'top left', background: gradientDown }} />
                            <div style={{ width: '33.3%', height: '54.2%', left: '33%', top: '50%', position: 'absolute', transform: 'rotate(-95deg)', transformOrigin: 'top left', background: gradient }} />
                        </div>
                    </div>
                );
            case 3: // Small Circles (Snippet 4)
                return (
                    <div className="w-full h-full max-w-[400px] flex items-center justify-center">
                        <div className="relative w-full aspect-square">
                            <div style={{ width: '45%', height: '45%', left: '3%', top: '7%', position: 'absolute', transform: 'rotate(-30deg)', transformOrigin: 'center', background: gradient, borderRadius: '9999px' }} />
                            <div style={{ width: '45%', height: '45%', left: '28%', top: '49.6%', position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'center', background: gradient, borderRadius: '9999px' }} />
                            <div style={{ width: '45%', height: '45%', left: '53%', top: '7%', position: 'absolute', transform: 'rotate(30deg)', transformOrigin: 'center', background: gradient, borderRadius: '9999px' }} />
                        </div>
                    </div>
                );
            case 0: // Arches (Original)
            default:
                return (
                    <div className="flex items-end justify-center gap-0 w-full max-w-md h-full">
                        <div className="w-2/3 h-2/3 rounded-t-full z-10" style={{ background: gradient }} />
                        <div className="w-2/3 h-full rounded-t-full -ml-8" style={{ background: gradient }} />
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className={`flex items-center justify-between ${THEME.panel.header.padding}`}>
                <h2 className={`${THEME.panel.header.title} ${THEME.typography.color.label}`}>Preview</h2>
                <button
                    onClick={changePreview}
                    className={`${THEME.typography.size.xs} ${THEME.typography.color.label} hover:${THEME.typography.color.accent} transition-colors`}
                >
                    Change
                </button>
            </div>

            <div className="flex-1 relative rounded-xl overflow-hidden bg-black flex items-center justify-center p-4 min-h-[300px]">
                {renderPreview()}
            </div>
        </div>
    );
};
