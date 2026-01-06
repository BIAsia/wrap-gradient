import React from 'react';
import { ColorStop, InterpolationMode, BezierCurve } from '../types';
import { THEME } from '../config/theme';

interface InfoPanelProps {
    warpedStops?: ColorStop[];
    originalStops?: ColorStop[];
    interpolationMode?: InterpolationMode;
    curve?: BezierCurve;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    warpedStops,
    originalStops,
    interpolationMode = InterpolationMode.OKLCH,
    curve
}) => {
    // Row 1: Current Mode Gradient
    const warpedGradient = warpedStops && warpedStops.length > 0
        ? `linear-gradient(90deg, ${warpedStops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
        : 'linear-gradient(90deg, #FAFA55 0%, #FA46A3 100%)';

    // Row 2: NORMAL (RGB Linear) Gradient
    const normalGradient = originalStops && originalStops.length > 0
        ? `linear-gradient(90deg, ${originalStops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
        : 'linear-gradient(90deg, #FAFA55 0%, #FA46A3 100%)';

    const getSpaceDesc = (mode: InterpolationMode) => {
        switch (mode) {
            case InterpolationMode.OKLCH:
                return "OKLCH offers perceptual uniformity with intuitive lightness, chroma, and hue controls, making color adjustments predictable.";
            case InterpolationMode.OKLAB:
                return "OKLAB provides a perceptually uniform color space that balances lightness and color opposition, ideal for smooth, natural-looking gradients.";
            case InterpolationMode.RGB:
                return "RGB interpolates colors directly through standard electronic display channels, representing color as a combination of Red, Green, and Blue.";
            default:
                return "";
        }
    };

    const getCurveDesc = (c?: BezierCurve) => {
        if (!c) return "";
        const isLinear = Math.abs(c.p1.x - c.p1.y) < 0.01 && Math.abs(c.p2.x - c.p2.y) < 0.01;
        if (isLinear) {
            return " The linear distribution ensures a steady, even transition across the gradient path.";
        }
        return " Combined with a custom easing curve, it creates a more dynamic and naturally distributed transition.";
    };

    const isLinear = curve
        ? Math.abs(curve.p1.x - curve.p1.y) < 0.01 && Math.abs(curve.p2.x - curve.p2.y) < 0.01
        : true;

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-[2] flex flex-col min-h-0">
                {/* Row 1: Current Mode Gradient */}
                <div
                    className="flex-1 flex items-center justify-center m-6 mb-1 transition-all duration-500 overflow-hidden"
                    style={{ background: warpedGradient }}
                >
                    <h2 className="text-md font-regular italic tracking-tighter text-white uppercase text-center leading-none select-none">
                        {interpolationMode} + {isLinear ? 'Linear' : 'Smooth'}
                    </h2>
                </div>

                {/* Row 2: NORMAL (RGB Linear) Gradient */}
                <div
                    className="flex-1 flex items-center justify-center m-6 mt-1 transition-all duration-500 overflow-hidden"
                    style={{ background: normalGradient }}
                >
                    <h2 className="text-md font-regulars italic tracking-tighter text-white uppercase text-center leading-none select-none">
                        Linear RGB
                    </h2>
                </div>
            </div>

            {/* Description Section */}
            <div className="flex-1 flex items-center w-full">
                <p className={`${THEME.typography.color.secondary} ${THEME.typography.size.xs} leading-relaxed opacity-70`}>
                    {getSpaceDesc(interpolationMode)} {getCurveDesc(curve)}
                </p>
            </div>
        </div>
    );
};
