import { useState } from 'react';
import { Card, Input } from '../common';

interface RoadblockSolverProps {
  onFetchSpecs: (model: string) => void;
  onApplyNorms: () => void;
}

export function RoadblockSolver({ onFetchSpecs, onApplyNorms }: RoadblockSolverProps) {
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
        <span className="flex items-center gap-2">🚧 Roadblock Solver & Recovery</span>
        <span>{isExpanded ? 'Roll Up ▲' : 'Open Tools ▼'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-amber-500/10 space-y-3 text-xs bg-slate-900/50">
          <p className="text-slate-400">Missing Datasheets? Auto-Retrieve Specs:</p>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              label=""
              type="text"
              placeholder="e.g., Perkins 904J, Cummins QSB6.7"
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
          <div className="flex gap-2 items-center pt-1 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onApplyNorms}
              className="flex-1 py-1 bg-slate-800 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-750 transition"
            >
              🎲 Apply Norms
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

import { useRef } from 'react';