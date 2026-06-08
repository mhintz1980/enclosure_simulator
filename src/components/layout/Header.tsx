import { StatusBadge } from '../common';
import { UnitSystem } from '../../hooks/useUnitSystem';

interface HeaderProps {
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  unitSystem: UnitSystem;
  onToggleUnitSystem: () => void;
}

export function Header({ status, unitSystem, onToggleUnitSystem }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 pb-4 mb-6">
      <span className="text-amber-500 font-mono text-sm tracking-widest uppercase">Pump Enclosure Design Workbench</span>
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold text-white mt-1">Pump Enclosure Acoustic &amp; Thermal Simulator</h1>
        <button
          onClick={onToggleUnitSystem}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono transition-colors"
        >
          <span>Unit System:</span>
          <span className="text-sky-400 font-bold">{unitSystem}</span>
        </button>
      </div>
      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
        <span>Design Ambient: {unitSystem === 'SI' ? '32.5°C' : '90.5°F'}</span>
        <StatusBadge status={status} />
      </div>
    </header>
  );
}