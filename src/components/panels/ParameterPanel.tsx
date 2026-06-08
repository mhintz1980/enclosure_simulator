import { Card, Slider, Select, Collapsible } from '../common';
import {
  VacuumPumpType,
  VacuumPumpConfig,
  MountType,
  EnclosureDimensions,
  DirectivityPlacement,
} from '../../types';
import { VACUUM_PUMP_HEAT_REFERENCE, DIRECTIVITY_FACTORS, ENGINE_PRESETS } from '../../utils/constants';

interface ParameterPanelProps {
  // Engine
  engineHeat: number;
  onEngineHeatChange: (value: number) => void;
  radiatorAirflow: number;
  onRadiatorAirflowChange: (value: number) => void;
  targetEnclosureTemp: number;
  onTargetEnclosureTempChange: (value: number) => void;
  // Optimization
  optimizationFocus: 'solve-height' | 'solve-pressure';
  onOptimizationFocusChange: (value: 'solve-height' | 'solve-pressure') => void;
  // Vacuum pump
  vacuumPumpConfig: VacuumPumpConfig;
  onVacuumPumpConfigChange: (config: VacuumPumpConfig) => void;
  // Mount
  mountType: MountType;
  onMountTypeChange: (value: MountType) => void;
  // Enclosure dimensions
  enclosureDimensions: EnclosureDimensions;
  onEnclosureDimensionsChange: (dims: EnclosureDimensions) => void;
  // Noise
  sourceSWL: number;
  onSourceSWLChange: (value: number) => void;
  directivityPlacement: DirectivityPlacement;
  onDirectivityPlacementChange: (value: DirectivityPlacement) => void;
  // Computed metrics for display
  designMetrics: {
    qThermalRequired: number;
    isAirflowDeficient: boolean;
    totalHeatLoad: number;
  };
}

export function ParameterPanel({
  engineHeat,
  onEngineHeatChange,
  radiatorAirflow,
  onRadiatorAirflowChange,
  targetEnclosureTemp,
  onTargetEnclosureTempChange,
  optimizationFocus,
  onOptimizationFocusChange,
  vacuumPumpConfig,
  onVacuumPumpConfigChange,
  mountType,
  onMountTypeChange,
  enclosureDimensions,
  onEnclosureDimensionsChange,
  sourceSWL,
  onSourceSWLChange,
  directivityPlacement,
  onDirectivityPlacementChange,
  designMetrics,
}: ParameterPanelProps) {
  const hasVacPump = vacuumPumpConfig.type !== 'none';

  return (
    <div className="space-y-4">
      {/* ── Engine Parameters ── */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
          🔧 Engine & Thermal
        </h3>
        <div className="space-y-4">
          <Slider
            label="Engine Heat Rejection"
            value={engineHeat}
            onChange={onEngineHeatChange}
            min={1}
            max={100}
            step={0.5}
            unit="kW"
          />
          <Collapsible title="📖 What is this?" className="mt-1">
            <div className="space-y-1.5 text-slate-400">
              <div>
                <span className="text-amber-400 font-mono">Where to find:</span> Engine Datasheet → Energy Balance → Heat Rejection to Atmosphere
              </div>
              <p>Heat radiated from the engine block, exhaust manifold, and other hot surfaces directly into the enclosure air. This is NOT the heat going into the coolant/radiator.</p>
              <div className="pt-1 text-slate-500 italic border-t border-slate-800/40">
                <span className="font-semibold text-slate-400">🛠️ Quick reference:</span> Select your engine below to auto-fill.
              </div>
              <select
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                defaultValue=""
                onChange={(e) => {
                  const preset = ENGINE_PRESETS.find(p => p.model === e.target.value);
                  if (preset) {
                    onEngineHeatChange(preset.heatRejection);
                    onRadiatorAirflowChange(preset.radiatorAirflow);
                  }
                }}
              >
                <option value="" disabled>Select engine to auto-fill...</option>
                {ENGINE_PRESETS.map((p) => (
                  <option key={p.model} value={p.model}>
                    {p.manufacturer} {p.model} ({p.ratedPower} kW, {p.cooling}-cooled)
                  </option>
                ))}
              </select>
            </div>
          </Collapsible>

          <Slider
            label="Engine Radiator Fan Airflow"
            value={radiatorAirflow}
            onChange={onRadiatorAirflowChange}
            min={0.1}
            max={10}
            step={0.1}
            unit="m³/s"
          />
          <Collapsible title="📖 What is this?" className="mt-1">
            <div className="space-y-1.5 text-slate-400">
              <div>
                <span className="text-amber-400 font-mono">Where to find:</span> Engine Spec Manual → Cooling System → Fan Airflow Capacity
              </div>
              <p>The volume of air your engine's radiator fan can push through the enclosure. This is the "engine" that drives all the cooling airflow.</p>
            </div>
          </Collapsible>

          <Slider
            label="Max Allowed Enclosure Temp"
            value={targetEnclosureTemp}
            onChange={onTargetEnclosureTempChange}
            min={35}
            max={65}
            step={0.5}
            unit="°C"
          />

          <div className="pt-2 border-t border-slate-800/60">
            <Select
              label="Optimization Strategy"
              value={optimizationFocus}
              onChange={(v) => onOptimizationFocusChange(v as 'solve-height' | 'solve-pressure')}
              options={[
                { value: 'solve-height', label: 'Solve for Required Duct Height (Constrained Max ΔP)' },
                { value: 'solve-pressure', label: 'Calculate ΔP (Fixed Height 1.6m)' },
              ] as const}
            />
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-xs space-y-1">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Total Heat Load:</span>
              <span className="text-white font-bold">{designMetrics.totalHeatLoad.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min. Cooling Airflow:</span>
              <span className="text-white font-bold">{designMetrics.qThermalRequired.toFixed(2)} m³/s</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Design Airflow:</span>
              <span className={`font-bold ${designMetrics.isAirflowDeficient ? 'text-rose-400' : 'text-emerald-400'}`}>
                {designMetrics.isAirflowDeficient ? '⚠ Auto-adjusted (deficient)' : '✓ Radiator fan adequate'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Vacuum Pump ── */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
          🌀 Vacuum Pump (Optional)
        </h3>
        <div className="space-y-3">
          <Select
            label="Vacuum Pump Type"
            value={vacuumPumpConfig.type}
            onChange={(v) => {
              const newType = v as VacuumPumpType;
              const ref = VACUUM_PUMP_HEAT_REFERENCE[newType];
              onVacuumPumpConfigChange({
                ...vacuumPumpConfig,
                type: newType,
                heatRejection: ref?.typicalHeat ?? 0,
                hasOilCooler: newType === 'rotary-vane-oil',
                oilCoolerHeat: newType === 'rotary-vane-oil' ? 1.5 : 0,
              });
            }}
            options={[
              { value: 'none', label: 'No Vacuum Pump' },
              { value: 'rotary-vane-dry', label: 'Rotary Vane (Dry)' },
              { value: 'rotary-vane-oil', label: 'Rotary Vane (Oil-Cooled)' },
              { value: 'rotary-claw', label: 'Rotary Claw' },
              { value: 'liquid-ring', label: 'Liquid Ring' },
            ] as const}
          />

          {hasVacPump && (
            <>
              <Slider
                label="Vacuum Pump Heat Rejection"
                value={vacuumPumpConfig.heatRejection}
                onChange={(v) => onVacuumPumpConfigChange({ ...vacuumPumpConfig, heatRejection: v })}
                min={0}
                max={15}
                step={0.5}
                unit="kW"
              />
              <Collapsible title="📖 What is this?" className="mt-1">
                <div className="text-slate-400 text-xs">
                  Heat radiated by the vacuum pump into the shared enclosure air. This adds to the engine heat
                  and increases the total cooling airflow requirement.
                  <div className="mt-1 pt-1 border-t border-slate-800/40 text-slate-500 italic">
                    {VACUUM_PUMP_HEAT_REFERENCE[vacuumPumpConfig.type]?.description}
                  </div>
                </div>
              </Collapsible>

              {vacuumPumpConfig.type === 'rotary-vane-oil' && (
                <Slider
                  label="Oil Cooler Heat (Inside Enclosure)"
                  value={vacuumPumpConfig.oilCoolerHeat}
                  onChange={(v) => onVacuumPumpConfigChange({ ...vacuumPumpConfig, oilCoolerHeat: v })}
                  min={0}
                  max={8}
                  step={0.5}
                  unit="kW"
                />
              )}
            </>
          )}
        </div>
      </Card>

      {/* ── Enclosure & Mount ── */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
          📐 Enclosure & Mounting
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">Length (m)</label>
              <input
                type="number" step="0.1" min="0.5" max="10"
                value={enclosureDimensions.length}
                onChange={(e) => onEnclosureDimensionsChange({ ...enclosureDimensions, length: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">Width (m)</label>
              <input
                type="number" step="0.1" min="0.5" max="6"
                value={enclosureDimensions.width}
                onChange={(e) => onEnclosureDimensionsChange({ ...enclosureDimensions, width: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">Height (m)</label>
              <input
                type="number" step="0.1" min="0.5" max="4"
                value={enclosureDimensions.height}
                onChange={(e) => onEnclosureDimensionsChange({ ...enclosureDimensions, height: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <Select
            label="Mount Type"
            value={mountType}
            onChange={(v) => onMountTypeChange(v as MountType)}
            options={[
              { value: 'skid', label: 'Skid Mounted' },
              { value: 'trailer', label: 'Trailer Mounted' },
              { value: 'stationary', label: 'Stationary' },
            ] as const}
          />
        </div>
      </Card>

      {/* ── Noise Parameters ── */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
          🔊 Noise Estimation
        </h3>
        <div className="space-y-3">
          <Slider
            label="Source Sound Power Level"
            value={sourceSWL}
            onChange={onSourceSWLChange}
            min={70}
            max={130}
            step={1}
            unit="dB"
          />
          <Collapsible title="📖 What is this?" className="mt-1">
            <div className="text-slate-400 text-xs">
              The total sound power level of all noise sources inside the enclosure (engine, pump, vacuum pump) before any silencing.
              Check the engine datasheet for "Sound Power Level" or "LwA". If unavailable, use the engine preset auto-fill above for an estimate.
            </div>
          </Collapsible>

          <Select
            label="Enclosure Placement"
            value={directivityPlacement}
            onChange={(v) => onDirectivityPlacementChange(v as DirectivityPlacement)}
            options={Object.entries(DIRECTIVITY_FACTORS).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
          />
          <Collapsible title="📖 What does placement affect?" className="mt-1">
            <div className="text-slate-400 text-xs space-y-1">
              <p>Reflecting surfaces (ground, walls) concentrate sound energy in fewer directions, making it louder in those directions.</p>
              <p><strong>Half-Space (Q=2)</strong> is most common — the enclosure sits on flat ground. Choose Quarter or Eighth-Space if near walls.</p>
            </div>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}