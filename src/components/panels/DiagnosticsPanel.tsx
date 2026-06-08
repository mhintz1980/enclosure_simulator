import { useState } from 'react';
import { Card } from '../common';
import { AttenuationChart } from '../charts/AttenuationChart';
import { PressureDropChart } from '../charts/PressureDropChart';
import { VelocityChart } from '../charts/VelocityChart';
import { DuctCrossSection } from '../charts/DuctCrossSection';
import { EnclosureCrossSection } from '../charts/EnclosureCrossSection';
import { EnclosurePlanView } from '../charts/EnclosurePlanView';
import { NoiseDistanceChart } from '../charts/NoiseDistanceChart';
import { CalculationResults, VacuumPumpConfig, MountType, EnclosureDimensions } from '../../types';
import { UnitSystem } from '../../hooks/useUnitSystem';
import { convertToDisplay, getUnitLabel } from '../../utils/units';

interface DiagnosticsPanelProps {
  results: CalculationResults;
  intakeDuctWidth: number;
  intakeTargetLoss: number;
  dischargeDuctWidth: number;
  dischargeTargetLoss: number;
  vacuumPumpConfig: VacuumPumpConfig;
  mountType: MountType;
  enclosureDimensions: EnclosureDimensions;
  unitSystem: UnitSystem;
}

type ChartTab = 'cross-section' | 'plan-view' | 'noise' | 'attenuation' | 'pressure' | 'velocity' | 'geometry';

const TABS: { id: ChartTab; label: string; icon: string }[] = [
  { id: 'cross-section', label: 'Cross-Section', icon: '🏗️' },
  { id: 'plan-view', label: 'Plan View', icon: '📋' },
  { id: 'noise', label: 'Noise @ Distance', icon: '🔊' },
  { id: 'attenuation', label: 'Attenuation', icon: '📊' },
  { id: 'pressure', label: 'Pressure Drop', icon: '📉' },
  { id: 'velocity', label: 'Velocity', icon: '💨' },
  { id: 'geometry', label: 'Silencer Detail', icon: '📐' },
];

const riskColor = (risk: 'LOW' | 'MODERATE' | 'CRITICAL') => {
  switch (risk) {
    case 'CRITICAL': return 'text-rose-400';
    case 'MODERATE': return 'text-amber-400';
    default: return 'text-emerald-400';
  }
};

const vibRiskColor = (risk: 'LOW' | 'MODERATE' | 'HIGH') => {
  switch (risk) {
    case 'HIGH': return 'text-rose-400';
    case 'MODERATE': return 'text-amber-400';
    default: return 'text-emerald-400';
  }
};

export function DiagnosticsPanel({
  results,
  intakeDuctWidth,
  intakeTargetLoss,
  dischargeDuctWidth,
  dischargeTargetLoss,
  vacuumPumpConfig,
  mountType,
  enclosureDimensions,
  unitSystem,
}: DiagnosticsPanelProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('cross-section');

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
        System Diagnostics
      </h3>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-slate-950 rounded border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Total System ΔP</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Intake + Discharge</div>
          </div>
          <div className="text-xl font-bold text-amber-400">
            {convertToDisplay(results.totalSystemPressureDrop, 'pressure', unitSystem).toFixed(1)} {getUnitLabel('pressure', unitSystem)}
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Total Heat Load</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Engine + Vac Pump</div>
          </div>
          <div className="text-xl font-bold text-white">
            {convertToDisplay(results.totalHeatLoad, 'heatLoad', unitSystem).toFixed(1)} {getUnitLabel('heatLoad', unitSystem)}
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Min. Cooling Flow</div>
            <div className="text-[10px] text-slate-500 mt-0.5">For thermal balance</div>
          </div>
          <div className="text-lg font-bold text-white">
            {convertToDisplay(results.qThermalRequired, 'airflow', unitSystem).toFixed(2)} {getUnitLabel('airflow', unitSystem)}
          </div>
        </div>
      </div>

      {/* Intake / Discharge diagnostics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono">
          <div className="text-sky-400 border-b border-slate-800 pb-1 mb-2 font-bold">INTAKE DIAGNOSTICS</div>
          <div className="flex justify-between text-slate-400">
            <span>Face Velocity:</span>
            <span className="text-slate-200 font-bold">{convertToDisplay(results.intakeMetrics.faceVelocity, 'velocity', unitSystem).toFixed(2)} {getUnitLabel('velocity', unitSystem)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Interstitial Vel:</span>
            <span className="text-slate-200 font-bold">{convertToDisplay(results.intakeMetrics.interstitialVelocity, 'velocity', unitSystem).toFixed(2)} {getUnitLabel('velocity', unitSystem)}</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-1">
            <span>Self-Noise Risk:</span>
            <span className={`font-bold ${riskColor(results.intakeMetrics.selfNoiseRisk)}`}>{results.intakeMetrics.selfNoiseRisk}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono">
          <div className="text-rose-400 border-b border-slate-800 pb-1 mb-2 font-bold">DISCHARGE DIAGNOSTICS</div>
          <div className="flex justify-between text-slate-400">
            <span>Face Velocity:</span>
            <span className="text-slate-200 font-bold">{convertToDisplay(results.dischargeMetrics.faceVelocity, 'velocity', unitSystem).toFixed(2)} {getUnitLabel('velocity', unitSystem)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Interstitial Vel:</span>
            <span className="text-slate-200 font-bold">{convertToDisplay(results.dischargeMetrics.interstitialVelocity, 'velocity', unitSystem).toFixed(2)} {getUnitLabel('velocity', unitSystem)}</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-1">
            <span>Self-Noise Risk:</span>
            <span className={`font-bold ${riskColor(results.dischargeMetrics.selfNoiseRisk)}`}>{results.dischargeMetrics.selfNoiseRisk}</span>
          </div>
        </div>
      </div>

      {/* Vibration assessment */}
      <div className="p-3 bg-slate-950 rounded border border-slate-800 mb-4 text-xs">
        <div className="flex items-center justify-between font-mono mb-1">
          <span className="text-slate-400">Vibration Risk:</span>
          <span className={`font-bold ${vibRiskColor(results.vibrationAssessment.risk)}`}>
            {results.vibrationAssessment.risk}
          </span>
        </div>
        <p className="text-slate-500 text-[10px] mb-1">{results.vibrationAssessment.message}</p>
        {results.vibrationAssessment.recommendations.length > 0 && (
          <ul className="text-[10px] text-slate-500 space-y-0.5">
            {results.vibrationAssessment.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">▸</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status report */}
      <div className={`p-4 rounded-lg border text-sm mb-6 ${
        results.status === 'OPTIMAL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
        results.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
        'bg-rose-500/10 border-rose-500/20 text-rose-300'
      }`}>
        <div className="font-bold font-mono tracking-wide mb-1 uppercase">
          {results.status === 'OPTIMAL' ? '✅' : results.status === 'WARNING' ? '⚠️' : '🚨'} [{results.status}] DESIGN STATUS
        </div>
        <p className="text-xs leading-relaxed opacity-90">{results.statusMsg}</p>
      </div>

      {/* Charts Section */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-sky-500'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="p-4 bg-slate-900/30 min-h-[300px] flex items-center justify-center">
          {activeTab === 'cross-section' && (
            <EnclosureCrossSection
              dimensions={enclosureDimensions}
              intakeMetrics={results.intakeMetrics}
              dischargeMetrics={results.dischargeMetrics}
              vacuumPumpConfig={vacuumPumpConfig}
              mountType={mountType}
              designAirflow={results.designAirflow}
              unitSystem={unitSystem}
            />
          )}
          {activeTab === 'plan-view' && (
            <EnclosurePlanView
              dimensions={enclosureDimensions}
              vacuumPumpConfig={vacuumPumpConfig}
              mountType={mountType}
              designAirflow={results.designAirflow}
              unitSystem={unitSystem}
            />
          )}
          {activeTab === 'noise' && (
            <NoiseDistanceChart noiseResults={results.noiseResults} unitSystem={unitSystem} />
          )}
          {activeTab === 'attenuation' && (
            <AttenuationChart
              intakeProfile={results.intakeMetrics.selectedProfile}
              dischargeProfile={results.dischargeMetrics.selectedProfile}
            />
          )}
          {activeTab === 'pressure' && (
            <PressureDropChart
              intakeTargetLoss={intakeTargetLoss}
              dischargeTargetLoss={dischargeTargetLoss}
              intakeDuctWidth={intakeDuctWidth}
              dischargeDuctWidth={dischargeDuctWidth}
              designAirflow={results.designAirflow}
              airDensityEnclosure={results.airDensityEnclosure}
              currentIntakeHeight={results.intakeMetrics.ductHeight}
              currentDischargeHeight={results.dischargeMetrics.ductHeight}
              unitSystem={unitSystem}
            />
          )}
          {activeTab === 'velocity' && (
            <VelocityChart
              intakeMetrics={results.intakeMetrics}
              dischargeMetrics={results.dischargeMetrics}
              unitSystem={unitSystem}
            />
          )}
          {activeTab === 'geometry' && (
            <DuctCrossSection
              intakeMetrics={results.intakeMetrics}
              dischargeMetrics={results.dischargeMetrics}
              intakeDuctWidth={intakeDuctWidth}
              dischargeDuctWidth={dischargeDuctWidth}
              unitSystem={unitSystem}
            />
          )}
        </div>
      </div>
    </Card>
  );
}