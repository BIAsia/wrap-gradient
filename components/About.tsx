import React from 'react';
import { ExternalLink, Twitter } from 'lucide-react';
import { THEME } from '../config/theme';

export const About: React.FC = () => {
    const sections = [
        {
            titleEN: "Better gradients for production",
            contentEN: "Gradient-Box is built for creating perceptually uniform gradients. It bridges the gap between advanced color science and production-ready code for multiple platforms, including CSS, Figma, iOS, Android, and SVG.",
            titleCN: "更好的渐变实现",
            contentCN: "利用拟合转换。将更好的渐变模式带入多端生产环境，支持导出为 CSS、Figma、iOS、Android 及 SVG 基础格式"
        },
        {
            titleEN: "Why OKLCH & OKLAB?",
            contentEN: "Traditional RGB interpolation often results in 'gray dead zones' or muddy transitions. We use OKLCH and OKLAB color spaces to ensure consistent lightness and smooth, vibrant transitions that feel natural to the human eye.",
            titleCN: "为什么是 OKLCH / OKLAB？",
            contentCN: "传统的 RGB 渐变容易导致“灰色死区”或脏色。我们通过 OKLCH 和 OKLAB 色彩空间，确保了亮度的一致性和极其平滑的色彩过渡，更符合人眼自然感知"
        },
        {
            titleEN: "Complex Curves, Simple Code",
            contentEN: "Native code doesn't support complex easing gradients yet. We solve this by 'warping': sampling the easing curve to generate a series of adaptive linear stops. This pre-packages the complexity into a simple, high-performance linear gradient.",
            titleCN: "曲线精调，实现依旧简单",
            contentCN: "原生代码同样不支持对渐变曲线做调整。通过拟合对缓动曲线进行采样，用最基础的线性渐变模拟实现，效果相近"
        }
    ];

    return (
        <div className={`flex-1 overflow-y-auto ${THEME.layout.padding.relaxed} max-w-5xl mx-auto w-full custom-scrollbar`}>
            {/* Main Header */}
            <header className="mb-16 mt-8">
                <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 ${THEME.typography.color.primary}`}>
                    About the tool
                </h1>
            </header>

            <div className="space-y-12">
                {sections.map((section, index) => (
                    <section key={index} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline border-t border-border pt-12">
                        {/* English Content */}
                        <div className="md:col-span-8 space-y-4">
                            <h2 className={`text-xl font-semibold ${THEME.typography.color.primary}`}>
                                {section.titleEN}
                            </h2>
                            <p className={`${THEME.typography.color.secondary} leading-relaxed text-base md:text-lg`}>
                                {section.contentEN}
                            </p>
                        </div>

                        {/* Chinese Content (Dimmed & Smaller) */}
                        <div className="md:col-span-4 space-y-2 opacity-50">
                            <h3 className={`text-sm font-medium ${THEME.typography.color.primary}`}>
                                {section.titleCN}
                            </h3>
                            <p className={`${THEME.typography.color.secondary} leading-relaxed text-xs md:text-sm`}>
                                {section.contentCN}
                            </p>
                        </div>
                    </section>
                ))}

                {/* Footer Links */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-border pt-12 pb-24">
                    <div className="md:col-span-8 flex flex-wrap gap-8">
                        <a
                            href="https://jakub.kr/components/oklch-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-primary hover:underline font-medium`}
                        >
                            OKLCH Reference <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 ${THEME.typography.color.secondary} hover:${THEME.typography.color.primary} transition-colors`}
                        >
                            <span>Support by TikTok Design System</span>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};
