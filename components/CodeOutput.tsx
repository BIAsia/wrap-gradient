import React, { useState } from 'react';
import { ColorStop, ExportFormat } from '../types';
import { Button } from './ui/Button';
import { Copy, Check } from 'lucide-react';
import { rgbToHex, hexToRgb } from '../utils/color';

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
      
      case ExportFormat.SWIFT:
        // Swift CAGradientLayer format
        const colors = sortedStops.map(s => {
           return `UIColor(hex: "${s.color}").cgColor`;
        }).join(',\n    ');
        
        const locations = sortedStops.map(s => s.position.toFixed(3)).join(', ');
        
        return `let gradientLayer = CAGradientLayer()
gradientLayer.colors = [
    ${colors}
]
gradientLayer.locations = [${locations}]
gradientLayer.startPoint = CGPoint(x: 0.0, y: 0.5)
gradientLayer.endPoint = CGPoint(x: 1.0, y: 0.5)`;

      case ExportFormat.COMPOSE:
        // Jetpack Compose Brush
        return `// Jetpack Compose
val gradient = Brush.horizontalGradient(
    colorStops = arrayOf(
${sortedStops.map(s => `        ${s.position.toFixed(3)}f to Color(0xFF${s.color.substring(1)})`).join(',\n')}
    )
)`;

      case ExportFormat.ANDROID_XML:
        // Android Vector Drawable with Gradient
        // Since gradients in Shape Drawables are limited, Vector is the best way to support >3 stops in XML
        const xmlItems = sortedStops.map(s => 
            `        <item android:offset="${s.position.toFixed(3)}" android:color="${s.color}"/>`
        ).join('\n');

        return `<!-- res/drawable/gradient_warped.xml -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="200dp"
    android:height="50dp"
    android:viewportWidth="1"
    android:viewportHeight="1">
    <path android:pathData="M0,0 L1,0 L1,1 L0,1 z">
        <aapt:attr name="android:fillColor">
            <gradient
                android:startX="0"
                android:endX="1"
                android:type="linear">
${xmlItems}
            </gradient>
        </aapt:attr>
    </path>
</vector>`;

      case ExportFormat.SVG:
         const svgStops = sortedStops.map(s => 
            `    <stop offset="${(s.position * 100).toFixed(1)}%" stop-color="${s.color}" />`
         ).join('\n');
         return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="warped-gradient" x1="0" y1="0" x2="1" y2="0">
${svgStops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#warped-gradient)" />
</svg>`;

      case ExportFormat.FIGMA:
        // Figma Scripter code to apply gradient to selected elements
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
  
  console.log('Gradient applied to ' + selection.length + ' element(s)');
}`;
        
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: ExportFormat.CSS, label: 'CSS' },
    { id: ExportFormat.SWIFT, label: 'Swift' },
    { id: ExportFormat.COMPOSE, label: 'Compose' },
    { id: ExportFormat.ANDROID_XML, label: 'Android XML' },
    { id: ExportFormat.SVG, label: 'SVG' },
    { id: ExportFormat.FIGMA, label: 'Figma' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1 mb-3 bg-stone-100 p-1 rounded-lg w-full sm:w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFormat(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex-1 sm:flex-none ${
              format === tab.id ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="relative flex-1 group">
        <textarea
          readOnly
          value={generateCode()}
          className="w-full h-48 sm:h-64 p-4 bg-stone-900 text-stone-50 font-mono text-xs rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-stone-700 leading-relaxed custom-scrollbar"
        />
        <Button 
            size="sm" 
            variant="ghost" 
            className="absolute top-2 right-2 text-stone-400 hover:text-white hover:bg-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
        >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
