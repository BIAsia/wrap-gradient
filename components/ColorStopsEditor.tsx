import React, { useState } from 'react';
import { ColorStop } from '../types';
import { Button } from './ui/Button';
import { Trash2, Plus, Download } from 'lucide-react';
import { parseGradientStops } from '../utils/gradientParser';

interface ColorStopsEditorProps {
  stops: ColorStop[];
  setStops: (stops: ColorStop[]) => void;
}

export const ColorStopsEditor: React.FC<ColorStopsEditorProps> = ({ stops, setStops }) => {
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseGradientStops(text);
      
      if (parsed && parsed.length >= 2) {
        setStops(parsed);
        setImportError(null);
      } else {
        setImportError('Could not parse gradient from clipboard. Please check the format.');
      }
    } catch (error) {
      setImportError('Failed to read from clipboard. Please grant clipboard permission.');
    }
  };
  
  const addStop = () => {
    // Add a new stop between the last two or at the end
    const last = stops[stops.length - 1];
    const prev = stops[stops.length - 2];
    
    let newPos = 1.0;
    let newColor = '#888888';

    if (last && prev) {
       newPos = prev.position + (last.position - prev.position) / 2;
       // Simply duplicate color for now, let user change it
       newColor = last.color; 
    } else if (last) {
       newPos = Math.min(1, last.position + 0.1);
    }
    
    // Actually simpler: just append at 1.0 or midway if full
    const newStop: ColorStop = {
        id: Math.random().toString(36).substr(2, 9),
        color: newColor,
        position: newPos
    };
    
    const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
    setStops(newStops);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return; // Prevent removing below 2 stops
    setStops(stops.filter(s => s.id !== id));
  };

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.position - b.position));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-sm font-semibold text-stone-900">Key Stops</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleImport} title="Import from clipboard">
            <Download className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button size="sm" variant="outline" onClick={addStop}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
      
      {importError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {importError}
        </div>
      )}
      
      <div className="space-y-2">
        {stops.map((stop, index) => (
            <div key={stop.id} className="flex items-center gap-2 p-2 bg-stone-50 border rounded-md group">
                <div className="relative">
                     <input 
                        type="color" 
                        value={stop.color}
                        onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 overflow-hidden"
                     />
                </div>
                
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>Color</span>
                        <span>{Math.round(stop.position * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={stop.position * 100}
                        onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value) / 100 })}
                        className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                    />
                </div>

                <button 
                    onClick={() => removeStop(stop.id)}
                    className={`p-1 text-stone-400 hover:text-red-500 transition-colors ${stops.length <= 2 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};
