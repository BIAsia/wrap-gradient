import React, { useState } from 'react';
import { ColorStop, ExportFormat } from '../types';
import { Copy, Check } from 'lucide-react';
import { hexToRgb } from '../utils/color';

interface CodeOutputProps {
  stops: ColorStop[];
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ stops }) => {
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.CSS);
  const [copied, setCopied] = useState(false);

  // ... (Keep generation logic but styled differently)
  const generateCode = () => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    switch (format) {
      case ExportFormat.CSS:
        return `background: linear-gradient(90deg, \n${sortedStops
          .map(s => `  ${s.color} ${Math.round(s.position * 10000) / 100}%`)
          .join(',\n')}\n);`;
      // ... (Rest of format logic is same, omitting for brevity in this step, assume standard implementation)
      case ExportFormat.IOS: // Changed from SWIFT for UI label match
        return `// iOS / Swift\nlet gradient = CAGradientLayer()\ngradient.colors = [\n${sortedStops.map(s => `    UIColor(hex: "${s.color}").cgColor`).join(',\n')}\n]`;
      case ExportFormat.ANDROID_XML:
        return `<!-- Android XML -->\n<gradient>\n${sortedStops.map(s => `    <item android:offset="${s.position.toFixed(2)}" android:color="${s.color}"/>`).join('\n')}\n</gradient>`;
      case ExportFormat.SVG:
        return `<linearGradient>\n${sortedStops.map(s => `    <stop offset="${(s.position * 100).toFixed(1)}%" stop-color="${s.color}"/>`).join('\n')}\n</linearGradient>`;
      case ExportFormat.FIGMA:
        return `// Figma\nconst gradient = {\n  type: 'GRADIENT_LINEAR',\n  stops: [\n${sortedStops.map(s => `    { position: ${s.position.toFixed(2)}, color: "${s.color}" }`).join(',\n')}\n  ]\n}`;
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-stone-500 font-medium">Export code</h2>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-stone-500 hover:text-white transition-colors"
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
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-stone-500 border-stone-800 hover:border-stone-600 hover:text-stone-300'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-stone-900 rounded-xl p-4 border border-stone-800 relative overflow-hidden group">
        <textarea
          readOnly
          value={generateCode()}
          className="w-full h-full bg-transparent text-stone-400 font-mono text-xs resize-none focus:outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
