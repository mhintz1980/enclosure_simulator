import { useState } from 'react';
import { CalculationInputs } from './utils/calculations';
import { useCalculations } from './hooks/useCalculations';
import { useChat } from './hooks/useChat';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ParameterPanel } from './components/panels/ParameterPanel';
import { DuctConfigPanel } from './components/panels/DuctConfigPanel';
import { DiagnosticsPanel } from './components/panels/DiagnosticsPanel';
import { ChatPanel } from './components/panels/ChatPanel';
import { RoadblockSolver } from './components/panels/RoadblockSolver';

export default function App() {
  const [heatLoad, setHeatLoad] = useState(150);
  const [combustionAirflow, setCombustionAirflow] = useState(12.0);
  const [targetEnclosureTemp, setTargetEnclosureTemp] = useState(42.0);

  const [intakeTargetLoss, setIntakeTargetLoss] = useState(20);
  const [dischargeTargetLoss, setDischargeTargetLoss] = useState(28);

  const [intakeDuctWidth, setIntakeDuctWidth] = useState(1.8);
  const [dischargeDuctWidth, setDischargeDuctWidth] = useState(1.8);

  const [intakeMaxDP, setIntakeMaxDP] = useState(30);
  const [dischargeMaxDP, setDischargeMaxDP] = useState(30);

  const [optimizationFocus, setOptimizationFocus] = useState<'solve-height' | 'solve-pressure'>('solve-height');

  const inputs: CalculationInputs = {
    heatLoad,
    combustionAirflow,
    targetEnclosureTemp,
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
  };

  const designMetrics = useCalculations(inputs);

  const { sendMessage } = useChat();

  const handleFetchSpecs = (model: string) => {
    sendMessage(`Retrieve manufacturing data for ${model}`, designMetrics, optimizationFocus, setHeatLoad, setCombustionAirflow);
  };

  const handleApplyNorms = () => {
    setHeatLoad(45);
    setCombustionAirflow(4.2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <Header status={designMetrics.status} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Sidebar className="xl:col-span-4">
          <div className="space-y-6">
            <RoadblockSolver
              onFetchSpecs={handleFetchSpecs}
              onApplyNorms={handleApplyNorms}
            />

            <ParameterPanel
              heatLoad={heatLoad}
              onHeatLoadChange={setHeatLoad}
              combustionAirflow={combustionAirflow}
              onCombustionAirflowChange={setCombustionAirflow}
              targetEnclosureTemp={targetEnclosureTemp}
              onTargetEnclosureTempChange={setTargetEnclosureTemp}
              optimizationFocus={optimizationFocus}
              onOptimizationFocusChange={setOptimizationFocus}
              designMetrics={{
                qThermalRequired: designMetrics.qThermalRequired,
                isAirflowDeficient: designMetrics.isAirflowDeficient,
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
            />

          <ChatPanel
            designMetrics={designMetrics}
            optimizationFocus={optimizationFocus}
            setHeatLoad={setHeatLoad}
            setCombustionAirflow={setCombustionAirflow}
          />
        </MainContent>
      </div>
    </div>
  );
}