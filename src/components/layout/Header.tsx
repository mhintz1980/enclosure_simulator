import { StatusBadge } from '../common';

interface HeaderProps {
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export function Header({ status }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 pb-4 mb-6">
      <span className="text-amber-500 font-mono text-sm tracking-widest uppercase">Pump Enclosure Design Workbench</span>
      <h1 className="text-2xl font-bold text-white mt-1">Pump Enclosure Acoustic &amp; Thermal Simulator</h1>
      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
        <span>Design Ambient: 32.5°C (90.5°F)</span>
        <StatusBadge status={status} />
      </div>
    </header>
  );
}