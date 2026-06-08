import { useState } from 'react';
import { CalculationInputs, PumpPackagePreset } from './types/ui';
import { VacuumPumpConfig, MountType, EnclosureDimensions, DirectivityPlacement } from './types';
import { useCalculations } from './hooks/useCalculations';
import { useChat } from './hooks/useChat';
import { DEFAULT_NOISE_DISTANCES, VACUUM_PUMP_HEAT_REFERENCE } from './utils/constants';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ParameterPanel } from './components/panels/ParameterPanel';
import { DuctConfigPanel } from './components/panels/DuctConfigPanel';
import { DiagnosticsPanel } from './components/panels/DiagnosticsPanel';
import { ChatPanel } from './components/panels/ChatPanel';
import { RoadblockSolver } from './components/panels/RoadblockSolver';

export default function App() {
  // ── Engine & Thermal State ──
  const [engineHeat, setEngineHeat] = useState(7.0);
  const [radiatorAirflow, setRadiatorAirflow] = useState(2.0);
  const [targetEnclosureTemp, setTargetEnclosureTemp] = useState(45.0);

  // ── Vacuum Pump State ──
  const [vacuumPumpConfig, setVacuumPumpConfig] = useState<VacuumPumpConfig>({
    type: 'none',
    heatRejection: 0,
    hasOilCooler: false,
    oilCoolerHeat: 0,
  });

  // ── Silencer / Duct Config ──
  const [intakeTargetLoss, setIntakeTargetLoss] = useState(20);
  const [dischargeTargetLoss, setDischargeTargetLoss] = useState(28);
  const [intakeDuctWidth, setIntakeDuctWidth] = useState(1.2);
  const [dischargeDuctWidth, setDischargeDuctWidth] = useState(1.2);
  const [intakeMaxDP, setIntakeMaxDP] = useState(30);
  const [dischargeMaxDP, setDischargeMaxDP] = useState(30);
  const [optimizationFocus, setOptimizationFocus] = useState<'solve-height' | 'solve-pressure'>('solve-height');

  // ── Enclosure & Mount ──
  const [mountType, setMountType] = useState<MountType>('skid');
  const [enclosureDimensions, setEnclosureDimensions] = useState<EnclosureDimensions>({
    length: 3.0,
    width: 1.5,
    height: 1.8,
  });

  // ── Noise Parameters ──
  const [sourceSWL, setSourceSWL] = useState(100);
  const [directivityPlacement, setDirectivityPlacement] = useState<DirectivityPlacement>('half-space');
  const [noiseMeasurementDistances] = useState(DEFAULT_NOISE_DISTANCES);

  // ── Build Calculation Inputs ──
  const inputs: CalculationInputs = {
    engineHeat,
    radiatorAirflow,
    targetEnclosureTemp,
    vacuumPumpConfig,
    intakeConfig: {
      targetLoss: intakeTargetLoss,
      ductWidth: intakeDuctWidth,
      maxDP: intakeMaxDP,
    },
    dischargeConfig: {
      targetLoss: dischargeTargetLoss,
      ductWidth: dischargeDuctWidth,
      maxDP: dischargeMaxDP,
    },
    optimizationFocus,
    mountType,
    enclosureDimensions,
    noiseMeasurementDistances,
    directivityPlacement,
    sourceSWL,
  };

  const designMetrics = useCalculations(inputs);
  const { sendMessage } = useChat();

  // ── Preset Application ──
  const handleApplyPreset = (preset: PumpPackagePreset) => {
    setEngineHeat(preset.engineHeat);
    setRadiatorAirflow(preset.radiatorAirflow);
    setTargetEnclosureTemp(preset.targetEnclosureTemp);
    setSourceSWL(preset.sourceSWL);

    const vacRef = VACUUM_PUMP_HEAT_REFERENCE[preset.vacuumPumpType];
    setVacuumPumpConfig({
      type: preset.vacuumPumpType,
      heatRejection: preset.vacuumPumpHeat || vacRef?.typicalHeat || 0,
      hasOilCooler: preset.vacuumPumpType === 'rotary-vane-oil',
      oilCoolerHeat: preset.vacuumPumpType === 'rotary-vane-oil' ? 1.5 : 0,
    });
  };

  // ── Engine Spec Fetch ──
  const handleFetchSpecs = (model: string) => {
    sendMessage(`Retrieve manufacturing data for ${model}`, designMetrics, optimizationFocus, setEngineHeat, setRadiatorAirflow);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <Header status={designMetrics.status} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Sidebar className="xl:col-span-4">
          <div className="space-y-6">
            <RoadblockSolver
              onApplyPreset={handleApplyPreset}
              onFetchSpecs={handleFetchSpecs}
            />

            <ParameterPanel
              engineHeat={engineHeat}
              onEngineHeatChange={setEngineHeat}
              radiatorAirflow={radiatorAirflow}
              onRadiatorAirflowChange={setRadiatorAirflow}
              targetEnclosureTemp={targetEnclosureTemp}
              onTargetEnclosureTempChange={setTargetEnclosureTemp}
              optimizationFocus={optimizationFocus}
              onOptimizationFocusChange={setOptimizationFocus}
              vacuumPumpConfig={vacuumPumpConfig}
              onVacuumPumpConfigChange={setVacuumPumpConfig}
              mountType={mountType}
              onMountTypeChange={setMountType}
              enclosureDimensions={enclosureDimensions}
              onEnclosureDimensionsChange={setEnclosureDimensions}
              sourceSWL={sourceSWL}
              onSourceSWLChange={setSourceSWL}
              directivityPlacement={directivityPlacement}
              onDirectivityPlacementChange={setDirectivityPlacement}
              designMetrics={{
                qThermalRequired: designMetrics.qThermalRequired,
                isAirflowDeficient: designMetrics.isAirflowDeficient,
                totalHeatLoad: designMetrics.totalHeatLoad,
              }}
            />
          </div>
        </Sidebar>

        <MainContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DuctConfigPanel
              label="Intake"
              color="sky"
              targetLoss={intakeTargetLoss}
              onTargetLossChange={setIntakeTargetLoss}
              ductWidth={intakeDuctWidth}
              onDuctWidthChange={setIntakeDuctWidth}
              maxDP={intakeMaxDP}
              onMaxDPChange={setIntakeMaxDP}
              isMaxDPDisabled={optimizationFocus !== 'solve-height'}
              metrics={designMetrics.intakeMetrics}
            />

            <DuctConfigPanel
              label="Discharge"
              color="rose"
              targetLoss={dischargeTargetLoss}
              onTargetLossChange={setDischargeTargetLoss}
              ductWidth={dischargeDuctWidth}
              onDuctWidthChange={setDischargeDuctWidth}
              maxDP={dischargeMaxDP}
              onMaxDPChange={setDischargeMaxDP}
              isMaxDPDisabled={optimizationFocus !== 'solve-height'}
              metrics={designMetrics.dischargeMetrics}
            />
          </div>

          <DiagnosticsPanel
            results={designMetrics}
            intakeDuctWidth={intakeDuctWidth}
            intakeTargetLoss={intakeTargetLoss}
            dischargeDuctWidth={dischargeDuctWidth}
            dischargeTargetLoss={dischargeTargetLoss}
            vacuumPumpConfig={vacuumPumpConfig}
            mountType={mountType}
            enclosureDimensions={enclosureDimensions}
          />

          <ChatPanel
            designMetrics={designMetrics}
            optimizationFocus={optimizationFocus}
            setHeatLoad={setEngineHeat}
            setCombustionAirflow={setRadiatorAirflow}
          />
        </MainContent>
      </div>
    </div>
  );
}