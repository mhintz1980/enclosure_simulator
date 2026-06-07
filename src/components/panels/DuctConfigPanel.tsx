import { Card, Input } from '../common';
import { DuctMetrics } from '../../types';

interface DuctConfigPanelProps {
  label: 'Intake' | 'Discharge';
  color: 'sky' | 'rose';
  targetLoss: number;
  onTargetLossChange: (value: number) => void;
  ductWidth: number;
  onDuctWidthChange: (value: number) => void;
  maxDP: number;
  onMaxDPChange: (value: number) => void;
  isMaxDPDisabled: boolean;
  metrics: DuctMetrics;
}

const colorClasses: Record<'sky' | 'rose', { accent: string; text: string; bg: string }> = {
  sky: { accent: 'sky-500', text: 'sky-400', bg: 'sky-500' },
  rose: { accent: 'rose-500', text: 'rose-400', bg: 'rose-500' },
};

export function DuctConfigPanel({
  label,
  color,
  targetLoss,
  onTargetLossChange,
  ductWidth,
  onDuctWidthChange,
  maxDP,
  onMaxDPChange,
  isMaxDPDisabled,
  metrics,
}: DuctConfigPanelProps) {
  const { text, bg } = colorClasses[color];

  return (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--color-${bg})` }} />
        {label} Parameters
      </h3>
      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
        <div>
          <Input
            label="Target Loss (dB)"
            type="number"
            value={targetLoss}
            onChange={(e) => onTargetLossChange(Number(e.target.value))}
            unit="dB"
          />
        </div>
        <div>
          <Input
            label="Width (m)"
            type="number"
            step="0.1"
            value={ductWidth}
            onChange={(e) => onDuctWidthChange(Number(e.target.value))}
            unit="m"
          />
        </div>
        <div>
          <Input
            label="Max ΔP (Pa)"
            type="number"
            value={maxDP}
            onChange={(e) => onMaxDPChange(Number(e.target.value))}
            unit="Pa"
            disabled={isMaxDPDisabled}
          />
        </div>
      </div>
      <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2">
        <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 font-mono">Duct Area</div>
          <div className="text-sm font-bold text-white mt-0.5">{metrics.calculatedArea.toFixed(2)} m²</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{ductWidth}W × {metrics.ductHeight.toFixed(2)}H</div>
        </div>
        <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 font-mono">ΔP Drop</div>
          <div className="text-sm font-bold" style={{ color: `var(--color-${text})` }}>{metrics.computedPressureDrop.toFixed(1)} Pa</div>
        </div>
        <div className="col-span-2 p-2 bg-slate-950 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500 font-mono mb-1">Silencer Profile</div>
          <div className="text-xs font-bold text-slate-300">{metrics.selectedProfile.name.split(' (')[0]}</div>
        </div>
      </div>
    </Card>
  );
}