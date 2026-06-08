import { useState, useRef } from 'react';
import { Card, Input } from '../common';
import { DEFAULT_PUMP_PRESETS } from '../../utils/constants';
import { PumpPackagePreset } from '../../types/ui';

interface RoadblockSolverProps {
  onApplyPreset: (preset: PumpPackagePreset) => void;
  onFetchSpecs: (model: string) => void;
}

export function RoadblockSolver({ onApplyPreset, onFetchSpecs }: RoadblockSolverProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFetch = () => {
    if (searchInput.trim()) {
      onFetchSpecs(searchInput);
      setSearchInput('');
    }
  };

  return (
    <Card className="border-amber-500/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-amber-500/10 flex items-center justify-between text-left text-amber-400 font-semibold text-sm hover:bg-amber-500/20 transition"
      >
        <span className="flex items-center gap-2">🚀 Quick Start & Presets</span>
        <span>{isExpanded ? 'Collapse ▲' : 'Expand ▼'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-amber-500/10 space-y-4 text-xs bg-slate-900/50">
          {/* Pump Package Presets */}
          <div>
            <p className="text-slate-300 font-semibold mb-2">Load a Pump Package Preset:</p>
            <div className="grid gap-2">
              {DEFAULT_PUMP_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className="w-full text-left px-3 py-2 bg-slate-800/60 rounded border border-slate-700/50 hover:border-amber-500/40 hover:bg-slate-800 transition text-slate-300 hover:text-white"
                >
                  <div className="font-semibold text-xs">{preset.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {preset.engineManufacturer} {preset.engineModel} · {preset.engineHeat} kW heat · {preset.radiatorAirflow} m³/s
                    {preset.vacuumPumpType !== 'none' ? ` · + ${preset.vacuumPumpType}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Engine Spec Search */}
          <div className="pt-2 border-t border-slate-800/60">
            <p className="text-slate-400 mb-2">Search Engine Specs (auto-fill heat & airflow):</p>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                label=""
                type="text"
                placeholder="e.g., Hatz 1D90, Perkins 904J, Isuzu 4LE2X"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleFetch}
                className="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded hover:bg-amber-400 transition"
              >
                Fetch
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}