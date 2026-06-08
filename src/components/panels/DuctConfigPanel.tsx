import { Card, Input, Collapsible } from '../common';
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
  const isIntake = label === 'Intake';

  return (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--color-${bg})` }} />
        {label} Silencer
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

      {/* Tortuous Path Education */}
      <Collapsible title={`📖 How does the ${label.toLowerCase()} silencer work?`} className="mb-3">
        <div className="text-slate-400 text-xs space-y-2">
          <p>
            The silencer uses a <strong className="text-slate-200">tortuous path</strong> design — parallel baffles
            force air to weave back and forth through narrow airways. This serpentine path:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li><strong className="text-slate-300">Absorbs sound energy</strong> — acoustic foam or mineral wool inside baffles converts sound waves to heat</li>
            <li><strong className="text-slate-300">Reflects sound</strong> — each turn creates an impedance change that reflects sound back toward the source</li>
            <li><strong className="text-slate-300">Creates pressure drop</strong> — the tradeoff: more attenuation = more restriction to airflow</li>
          </ul>
          {isIntake ? (
            <p className="pt-1 border-t border-slate-800/40 text-slate-500 italic">
              <strong>Intake tip:</strong> The intake silencer is the first thing cool air hits. Use a lower-attenuation profile (Type LD/MD) if your engine radiator fan has limited static pressure capability.
            </p>
          ) : (
            <p className="pt-1 border-t border-slate-800/40 text-slate-500 italic">
              <strong>Discharge tip:</strong> Hot air from the radiator passes through here. You can often use a more aggressive profile on the discharge side because the radiator fan is pushing air through — but watch the total system ΔP.
            </p>
          )}
          <div className="pt-1 border-t border-slate-800/40">
            <p className="text-slate-500 text-[10px]">
              <strong className="text-amber-400">Rule of thumb:</strong> Total system ΔP (intake + discharge) should stay under 60 Pa for most engine radiator fans. Over 100 Pa risks fan stalling.
            </p>
          </div>
        </div>
      </Collapsible>

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
          <div className="text-[10px] text-slate-500 font-mono mb-1">Silencer Profile (Tortuous Path)</div>
          <div className="text-xs font-bold text-slate-300">{metrics.selectedProfile.name.split(' (')[0]}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Baffle: {metrics.selectedProfile.baffleThickness}mm · Airway: {metrics.selectedProfile.airwayWidth}mm · Open: {metrics.selectedProfile.openArea}%
          </div>
        </div>
      </div>
    </Card>
  );
}