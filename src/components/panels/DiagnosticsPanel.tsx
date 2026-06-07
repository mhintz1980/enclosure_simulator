import { useState } from 'react';
import { Card } from '../common';
import { AttenuationChart } from '../charts/AttenuationChart';
import { PressureDropChart } from '../charts/PressureDropChart';
import { VelocityChart } from '../charts/VelocityChart';
import { DuctCrossSection } from '../charts/DuctCrossSection';
import { DuctMetrics, CalculationResults } from '../../types';

interface DiagnosticsPanelProps {
  results: CalculationResults;
  intakeDuctWidth: number;
  intakeTargetLoss: number;
  dischargeDuctWidth: number;
  dischargeTargetLoss: number;
}

type ChartTab = 'attenuation' | 'pressure' | 'velocity' | 'geometry';

const TABS: { id: ChartTab; label: string; icon: string }[] = [
  { id: 'attenuation', label: 'Attenuation', icon: '📊' },
  { id: 'pressure', label: 'Pressure Drop', icon: '📉' },
  { id: 'velocity', label: 'Velocity', icon: '💨' },
  { id: 'geometry', label: 'Geometry', icon: '📐' },
];

const riskColor = (risk: DuctMetrics['selfNoiseRisk']) => {
  switch (risk) {
    case 'CRITICAL': return 'text-rose-400';
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
}: DiagnosticsPanelProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('attenuation');

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-4">
        System Live Diagnostics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-slate-950 rounded border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Total System Pressure Drop</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Fan must overcome Intake + Discharge</div>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {results.totalSystemPressureDrop.toFixed(1)} Pa
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Min. Heat-Rejection Flow</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Airflow required for thermal balance</div>
          </div>
          <div className="text-xl font-bold text-white">
            {results.qThermalRequired.toFixed(2)} m³/s
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono">
          <div className="text-sky-400 border-b border-slate-800 pb-1 mb-2 font-bold">INTAKE DIAGNOSTICS</div>
          <div className="flex justify-between text-slate-400">
            <span>Face Velocity:</span>
            <span className="text-slate-200 font-bold">{results.intakeMetrics.faceVelocity.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Interstitial Vel:</span>
            <span className="text-slate-200 font-bold">{results.intakeMetrics.interstitialVelocity.toFixed(2)} m/s</span>
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
            <span className="text-slate-200 font-bold">{results.dischargeMetrics.faceVelocity.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Interstitial Vel:</span>
            <span className="text-slate-200 font-bold">{results.dischargeMetrics.interstitialVelocity.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-1">
            <span>Self-Noise Risk:</span>
            <span className={`font-bold ${riskColor(results.dischargeMetrics.selfNoiseRisk)}`}>{results.dischargeMetrics.selfNoiseRisk}</span>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg border text-sm mb-6 ${
        results.status === 'OPTIMAL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
        results.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
        'bg-rose-500/10 border-rose-500/20 text-rose-300'
      }`}>
        <div className="font-bold font-mono tracking-wide mb-1 uppercase">
          ⚠️ [{results.status}] DESIGN STATUS REPORT
        </div>
        <p className="text-xs leading-relaxed opacity-90">{results.statusMsg}</p>
      </div>

      {/* Charts Section */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider transition-all duration-150 ${
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
        <div className="p-4 bg-slate-900/30 min-h-[260px] flex items-center justify-center">
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
            />
          )}
          {activeTab === 'velocity' && (
            <VelocityChart
              intakeMetrics={results.intakeMetrics}
              dischargeMetrics={results.dischargeMetrics}
            />
          )}
          {activeTab === 'geometry' && (
            <DuctCrossSection
              intakeMetrics={results.intakeMetrics}
              dischargeMetrics={results.dischargeMetrics}
              intakeDuctWidth={intakeDuctWidth}
              dischargeDuctWidth={dischargeDuctWidth}
            />
          )}
        </div>
      </div>
    </Card>
  );
}