import { Card, Slider, Select, Collapsible } from '../common';

interface ParameterPanelProps {
  heatLoad: number;
  onHeatLoadChange: (value: number) => void;
  combustionAirflow: number;
  onCombustionAirflowChange: (value: number) => void;
  targetEnclosureTemp: number;
  onTargetEnclosureTempChange: (value: number) => void;
  optimizationFocus: 'solve-height' | 'solve-pressure';
  onOptimizationFocusChange: (value: 'solve-height' | 'solve-pressure') => void;
  designMetrics: {
    qThermalRequired: number;
    isAirflowDeficient: boolean;
  };
}

export function ParameterPanel({
  heatLoad,
  onHeatLoadChange,
  combustionAirflow,
  onCombustionAirflowChange,
  targetEnclosureTemp,
  onTargetEnclosureTempChange,
  optimizationFocus,
  onOptimizationFocusChange,
  designMetrics,
}: ParameterPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
          Core Parameters
        </h3>
        <div className="space-y-4">
          <Slider
            label="Radiated Heat Load"
            value={heatLoad}
            onChange={onHeatLoadChange}
            min={10}
            max={500}
            unit="kW"
          />
          <Collapsible
            title="📖 Where to find this info?"
            className="mt-1"
          >
              <div className="space-y-1.5 text-slate-400">
                <div><span className="text-amber-400 font-mono">Manufacturer Section:</span> Engine Datasheet &#8594; Energy Balance &#8594; Heat Rejection to Atmosphere</div>
                <p>Convective and radiant emissions directly out from the block components.</p>
                <div className="pt-1 text-slate-500 italic border-t border-slate-800/40">
                  <span className="font-semibold text-slate-400">🛠️ Reference Component Data:</span> Perkins 904J typically rejects ~7.0 kW at atmosphere. Add ~3.0 kW for core alternator configurations.
                </div>
              </div>
          </Collapsible>

          <Slider
            label="Engine / Radiator Airflow"
            value={combustionAirflow}
            onChange={onCombustionAirflowChange}
            min={1}
            max={50}
            step={0.5}
            unit="m³/s"
          />
          <Collapsible
            title="📖 Where to find this info?"
            className="mt-1"
          >
              <div className="space-y-1.5 text-slate-400">
                <div><span className="text-amber-400 font-mono">Manufacturer Section:</span> Engine Spec Manual &#8594; Cooling System Fan Requirements</div>
                <p>Covers dynamic radiator fan capacities paired with combustion metrics.</p>
                <div className="pt-1 text-slate-500 italic border-t border-slate-800/40">
                  <span className="font-semibold text-slate-400">🛠️ Reference Component Data:</span> 904J installations utilize standard pusher structures pushing ~1.8 to 2.2 m³/s.
                </div>
              </div>
          </Collapsible>

          <Slider
            label="Max Allowed Enclosure Temp"
            value={targetEnclosureTemp}
            onChange={onTargetEnclosureTempChange}
            min={35}
            max={60}
            step={0.5}
            unit="°C"
          />

          <div className="pt-2 border-t border-slate-800/60">
            <Select
              label="System Optimization Strategy"
              value={optimizationFocus}
              onChange={(v) => onOptimizationFocusChange(v as 'solve-height' | 'solve-pressure')}
              options={[
                { value: 'solve-height', label: 'Solve for Required Height (Constrained Max ΔP)' },
                { value: 'solve-pressure', label: 'Calculate ΔP (Fixed Height 1.6m)' },
              ] as const}
            />
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-xs space-y-1">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min. Heat-Rejection Flow:</span>
              <span className="text-white font-bold">{designMetrics.qThermalRequired.toFixed(2)} m³/s</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Design Airflow:</span>
              <span className={`font-bold ${designMetrics.isAirflowDeficient ? 'text-rose-400' : 'text-emerald-400'}`}>
                {designMetrics.isAirflowDeficient ? 'Auto-adjusted (deficient)' : 'User-defined'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}