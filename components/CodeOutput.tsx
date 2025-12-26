import React, { useState } from 'react';
import { ColorStop, ExportFormat } from '../types';
import { THEME } from '../config/theme';
import { hexToRgb } from '../utils/color';

interface CodeOutputProps {
    stops: ColorStop[];
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ stops }) => {
    const [format, setFormat] = useState<ExportFormat>(ExportFormat.CSS);
    const [copied, setCopied] = useState(false);

    const generateCode = () => {
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        switch (format) {
            case ExportFormat.CSS:
                return `background: linear-gradient(90deg, \n${sortedStops
                    .map(s => `  ${s.color} ${Math.round(s.position * 10000) / 100}%`)
                    .join(',\n')}\n);`;
            case ExportFormat.IOS:
                return `// iOS / Swift\nlet gradient = CAGradientLayer()\ngradient.colors = [\n${sortedStops.map(s => `    UIColor(hex: "${s.color}").cgColor`).join(',\n')}\n]`;
            case ExportFormat.ANDROID_XML:
                return `<!-- Android XML -->\n<gradient>\n${sortedStops.map(s => `    <item android:offset="${s.position.toFixed(2)}" android:color="${s.color}"/>`).join('\n')}\n</gradient>`;
            case ExportFormat.SVG:
                return `<linearGradient>\n${sortedStops.map(s => `    <stop offset="${(s.position * 100).toFixed(1)}%" stop-color="${s.color}"/>`).join('\n')}\n</linearGradient>`;
            case ExportFormat.FIGMA:
                const figmaStops = sortedStops.map(s => {
                    const [r, g, b] = hexToRgb(s.color);
                    return `    { position: ${s.position.toFixed(3)}, color: { r: ${r.toFixed(3)}, g: ${g.toFixed(3)}, b: ${b.toFixed(3)}, a: 1 } }`;
                }).join(',\n');
                return `// Figma Scripter - Run in Console
// Select elements in Figma first, then run this code
const selection = figma.currentPage.selection;

if (selection.length === 0) {
  console.log("Please select at least one element");
} else {
  const gradient = {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
${figmaStops}
    ]
  };
  
  selection.forEach(function(node) {
    if ('fills' in node) {
      node.fills = [gradient];
      console.log('Applied gradient to: ' + node.name);
    }
  });
  
  console.log('Gradient applied to ' + selection.length + ' element(s)');}`;
            default: return '';
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { id: ExportFormat.CSS, label: 'CSS' },
        { id: ExportFormat.IOS, label: 'iOS' },
        { id: ExportFormat.ANDROID_XML, label: 'Android' },
        { id: ExportFormat.SVG, label: 'SVG' },
        { id: ExportFormat.FIGMA, label: 'Figma' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className={`flex justify-between items-center ${THEME.panel.header.padding}`}>
                <h2 className={`${THEME.panel.header.title} ${THEME.typography.color.label}`}>Export code</h2>
                <button
                    onClick={handleCopy}
                    className={`${THEME.typography.size.xs} font-medium ${THEME.typography.color.label} hover:${THEME.typography.color.accent} ${THEME.animation.transition}`}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFormat(tab.id as ExportFormat)}
                        className={`
                px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap
                ${format === tab.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : `bg-transparent ${THEME.typography.color.label} border-border hover:border-muted-foreground hover:${THEME.typography.color.primary}`}
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-muted rounded-xl p-4 border border-border relative overflow-hidden group">
                <textarea
                    readOnly
                    value={generateCode()}
                    className="w-full h-full bg-transparent text-muted-foreground font-mono text-xs resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};
