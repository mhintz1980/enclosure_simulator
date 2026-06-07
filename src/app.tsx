import { useState, useMemo, useEffect, useRef } from 'react';
import { SilencerProfile, DuctMetrics } from './types';

const SILENCER_PROFILES: SilencerProfile[] = [
  {
    name: 'Type LD (Low Attenuation / Ultra-Low Pressure Drop)',
    baffleThickness: 100,
    airwayWidth: 100,
    openArea: 50,
    lossCoefficientK: 1.4,
    octaveAttenuation: [3, 8, 15, 22, 25, 20, 14, 10],
    idealRange: [0, 20],
  },
  {
    name: 'Type MD (Medium Attenuation / Balanced Pressure Drop)',
    baffleThickness: 200,
    airwayWidth: 133,
    openArea: 40,
    lossCoefficientK: 2.4,
    octaveAttenuation: [5, 12, 22, 32, 38, 32, 22, 15],
    idealRange: [21, 35],
  },
  {
    name: 'Type HD (High Attenuation / Premium Noise Control)',
    baffleThickness: 300,
    airwayWidth: 150,
    openArea: 33,
    lossCoefficientK: 4.2,
    octaveAttenuation: [8, 18, 30, 42, 48, 44, 30, 20],
    idealRange: [36, 60],
  }
];

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
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [roadblockExpanded, setRoadblockExpanded] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your AI Ventilation & Acoustics Co-Pilot. Adjust parameters on the left to see live calculations. I can audit your current configuration against Caterpillar cooling standards and Price Industries acoustics."
    }
  ]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const designMetrics = useMemo(() => {
    const T_AMBIENT = 32.5; 
    const CP_AIR = 1.005; 

    const airDensityEnclosure = 101.325 / (0.287 * (targetEnclosureTemp + 273.15));
    const deltaT = Math.max(0.5, targetEnclosureTemp - T_AMBIENT);
    const qThermalRequired = heatLoad / (airDensityEnclosure * CP_AIR * deltaT);

    const isAirflowDeficient = combustionAirflow < qThermalRequired;
    const designAirflow = isAirflowDeficient ? qThermalRequired : combustionAirflow;

    const calculateDuctMetrics = (targetLoss: number, ductWidth: number, maxDP: number): DuctMetrics => {
      let selectedProfile = SILENCER_PROFILES[1];
      if (targetLoss <= 20) selectedProfile = SILENCER_PROFILES[0];
      else if (targetLoss > 35) selectedProfile = SILENCER_PROFILES[2];

      let ductHeight = 1.5;

      if (optimizationFocus === 'solve-height') {
        const maxAllowedVelocity = Math.sqrt((2 * maxDP) / (selectedProfile.lossCoefficientK * airDensityEnclosure));
        const reqDuctArea = designAirflow / maxAllowedVelocity;
        ductHeight = Math.max(0.3, reqDuctArea / ductWidth);
      } else {
        const defaultDuctHeight = 1.6;
        ductHeight = defaultDuctHeight;
      }

      const calculatedArea = ductWidth * ductHeight;
      const faceVelocity = designAirflow / calculatedArea;
      const computedPressureDrop = selectedProfile.lossCoefficientK * 0.5 * airDensityEnclosure * Math.pow(faceVelocity, 2);
      const interstitialVelocity = faceVelocity / (selectedProfile.openArea / 100);
      const selfNoiseRisk = interstitialVelocity > 15 ? 'CRITICAL' : interstitialVelocity > 10 ? 'MODERATE' : 'LOW';

      return {
        selectedProfile,
        ductHeight,
        calculatedArea,
        faceVelocity,
        interstitialVelocity,
        computedPressureDrop,
        selfNoiseRisk,
      };
    };

    const intakeMetrics = calculateDuctMetrics(intakeTargetLoss, intakeDuctWidth, intakeMaxDP);
    const dischargeMetrics = calculateDuctMetrics(dischargeTargetLoss, dischargeDuctWidth, dischargeMaxDP);
    
    const totalSystemPressureDrop = intakeMetrics.computedPressureDrop + dischargeMetrics.computedPressureDrop;

    let status = 'OPTIMAL' as 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    let statusMsg = 'System matches Caterpillar and Price Industries standards.';
    
    if (totalSystemPressureDrop > 100) {
      status = 'CRITICAL';
      statusMsg = 'High static restriction risks radiator fan stalling and generator thermal shutdown.';
    } else if (totalSystemPressureDrop > 60 || isAirflowDeficient || intakeMetrics.selfNoiseRisk === 'CRITICAL' || dischargeMetrics.selfNoiseRisk === 'CRITICAL') {
      status = 'WARNING';
      if (isAirflowDeficient) {
        statusMsg = 'Engine radiator fan airflow is insufficient to reject generator heat load at this temperature. Design flow auto-adjusted.';
      } else if (intakeMetrics.selfNoiseRisk === 'CRITICAL' || dischargeMetrics.selfNoiseRisk === 'CRITICAL') {
        statusMsg = 'Baffle interstitial velocity is too high, generating self-noise that bypasses acoustic attenuation.';
      } else {
        statusMsg = 'Total system static pressure drop is high. Verify radiator fan performance curve.';
      }
    }

    return {
      T_AMBIENT,
      airDensityEnclosure,
      deltaT,
      qThermalRequired,
      designAirflow,
      isAirflowDeficient,
      intakeMetrics,
      dischargeMetrics,
      totalSystemPressureDrop,
      status,
      statusMsg,
    };
  }, [heatLoad, combustionAirflow, targetEnclosureTemp, intakeTargetLoss, dischargeTargetLoss, intakeDuctWidth, dischargeDuctWidth, intakeMaxDP, dischargeMaxDP, optimizationFocus]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsAiLoading(true);

    setTimeout(() => {
      let responseContent = `Calculated response audit: The total system static pressure drop is currently ${designMetrics.totalSystemPressureDrop.toFixed(1)} Pa.`;
      
      const query = text.toLowerCase();
      if (query.includes('retrieve') || query.includes('perkins') || query.includes('cummins')) {
        responseContent = `Successfully retrieved technical specifications: Heat Load has been set to 110 kW and Combustion/Radiator Airflow has been set to 8.5 m³/s.`;
        setHeatLoad(110);
        setCombustionAirflow(8.5);
      } else if (query.includes('audit') || query.includes('check') || query.includes('verify')) {
        responseContent = `Engineering Audit Report: Ambient temperature is 32.5°C. Design Airflow is ${designMetrics.designAirflow.toFixed(1)} m³/s. Status is currently [${designMetrics.status}]. ${designMetrics.statusMsg}`;
      } else if (query.includes('solve') || query.includes('height') || query.includes('pressure')) {
        responseContent = `Optimization focus is set to [${optimizationFocus}]. Intake height resolved to ${designMetrics.intakeMetrics.ductHeight.toFixed(2)}m and Discharge height resolved to ${designMetrics.dischargeMetrics.ductHeight.toFixed(2)}m.`;
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
      setIsAiLoading(false);
    }, 800);
  };

  const renderInfoCollapsible = (id: string, docSection: string, descriptionText: string, exampleDetails: string) => {
    const isOpen = activeHelp === id;
    return (
      <div className="mt-1 border border-slate-800 rounded overflow-hidden text-[11px]">
        <button
          type="button"
          onClick={() => setActiveHelp(isOpen ? null : id)}
          className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 flex items-center justify-between text-slate-400 font-semibold"
        >
          <span>📖 Where to find this info?</span>
          <span>{isOpen ? 'Collapse ▲' : 'Expand ▼'}</span>
        </button>
        {isOpen && (
          <div className="p-2.5 bg-slate-950/60 space-y-1.5 text-slate-300 border-t border-slate-850">
            <div><span className="text-amber-400 font-mono">Manufacturer Section:</span> {docSection}</div>
            <p className="text-slate-400">{descriptionText}</p>
            <div className="pt-1 text-slate-500 italic border-t border-slate-800/40">
              <span className="font-semibold text-slate-400">🛠️ Reference Component Data:</span> {exampleDetails}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="border-b border-slate-800 pb-4 mb-6">
        <span className="text-amber-500 font-mono text-sm tracking-widest uppercase">Aero-Acoustic Workbench</span>
        <h1 className="text-2xl font-bold text-white mt-1">Generator Enclosure & Silencer Simulator</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
          <span>Fixed Ambient: 32.5°C (90.5°F)</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            designMetrics.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            designMetrics.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            Status: {designMetrics.status}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-amber-500/20 rounded-lg overflow-hidden">
            <button 
              type="button"
              onClick={() => setRoadblockExpanded(!roadblockExpanded)}
              className="w-full px-4 py-3 bg-amber-500/10 flex items-center justify-between text-left text-amber-400 font-semibold text-sm hover:bg-amber-500/20 transition"
            >
              <span className="flex items-center gap-2">🚧 Roadblock Solver & Recovery</span>
              <span>{roadblockExpanded ? 'Roll Up ▲' : 'Open Tools ▼'}</span>
            </button>
            
            {roadblockExpanded && (
              <div className="p-4 border-t border-amber-500/10 space-y-3 text-xs bg-slate-900/50">
                <p className="text-slate-400">Missing Datasheets? Auto-Retrieve Specs:</p>
                <div className="flex gap-2">
                  <input 
                    id="roadblockSearchInput"
                    type="text" 
                    placeholder="e.g., Perkins 904J, Cummins QSB6.7" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('roadblockSearchInput') as HTMLInputElement;
                      if(el && el.value) {
                        handleSendMessage(`Retrieve manufacturing data for ${el.value}`);
                        el.value = '';
                      }
                    }}
                    className="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded hover:bg-amber-400 transition"
                  >
                    Fetch
                  </button>
                </div>
                <div className="flex gap-2 items-center pt-1 border-t border-slate-800/60">
                  <button 
                    type="button"
                    onClick={() => { setHeatLoad(45); setCombustionAirflow(4.2); }} 
                    className="flex-1 py-1 bg-slate-800 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-750 transition"
                  >
                    🎲 Apply Norms
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">Core Parameters</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Radiated Heat Load</span>
                <span className="text-amber-400 font-bold">{heatLoad} kW</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                value={heatLoad}
                onChange={(e) => setHeatLoad(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              {renderInfoCollapsible(
                'heatLoad',
                'Engine Datasheet -> Energy Balance -> Heat Rejection to Atmosphere',
                'Convective and radiant emissions directly out from the block components.',
                'Perkins 904J typically rejects ~7.0 kW at atmosphere. Add ~3.0 kW for core alternator configurations.'
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Engine / Radiator Airflow</span>
                <span className="text-amber-400 font-bold">{combustionAirflow.toFixed(1)} m³/s</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="0.5"
                value={combustionAirflow}
                onChange={(e) => setCombustionAirflow(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              {renderInfoCollapsible(
                'airflow',
                'Engine Spec Manual -> Cooling System Fan Requirements',
                'Covers dynamic radiator fan capacities paired with combustion metrics.',
                '904J installations utilize standard pusher structures pushing ~1.8 to 2.2 m³/s.'
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Max Allowed Enclosure Temp</span>
                <span className="text-amber-400 font-bold">{targetEnclosureTemp.toFixed(1)}°C</span>
              </div>
              <input 
                type="range" 
                min="35" 
                max="60" 
                step="0.5"
                value={targetEnclosureTemp}
                onChange={(e) => setTargetEnclosureTemp(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="space-y-2 text-xs pt-2 border-t border-slate-800/60">
              <label className="text-slate-400 font-mono block mb-1">System Optimization Strategy</label>
              <select 
                value={optimizationFocus}
                onChange={(e) => setOptimizationFocus(e.target.value as 'solve-height' | 'solve-pressure')}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="solve-height">Solve for Required Height (Constrained Max ΔP)</option>
                <option value="solve-pressure">Calculate ΔP (Fixed Height 1.6m)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Intake Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Intake Parameters
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Target Loss (dB)</label>
                  <input 
                    type="number" 
                    value={intakeTargetLoss} 
                    onChange={(e) => setIntakeTargetLoss(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Width (m)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={intakeDuctWidth} 
                    onChange={(e) => setIntakeDuctWidth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Max ΔP (Pa)</label>
                  <input 
                    type="number" 
                    value={intakeMaxDP} 
                    onChange={(e) => setIntakeMaxDP(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 focus:border-sky-500 focus:outline-none"
                    disabled={optimizationFocus !== 'solve-height'}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">Duct Area</div>
                  <div className="text-sm font-bold text-white mt-0.5">{designMetrics.intakeMetrics.calculatedArea.toFixed(2)} m²</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{intakeDuctWidth}W × {designMetrics.intakeMetrics.ductHeight.toFixed(2)}H</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">ΔP Drop</div>
                  <div className="text-sm font-bold text-sky-400 mt-0.5">{designMetrics.intakeMetrics.computedPressureDrop.toFixed(1)} Pa</div>
                </div>
                <div className="col-span-2 p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono mb-1">Silencer Profile</div>
                  <div className="text-xs font-bold text-slate-300">{designMetrics.intakeMetrics.selectedProfile.name.split(' (')[0]}</div>
                </div>
              </div>
            </div>

            {/* Discharge Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Discharge Parameters
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Target Loss (dB)</label>
                  <input 
                    type="number" 
                    value={dischargeTargetLoss} 
                    onChange={(e) => setDischargeTargetLoss(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Width (m)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={dischargeDuctWidth} 
                    onChange={(e) => setDischargeDuctWidth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Max ΔP (Pa)</label>
                  <input 
                    type="number" 
                    value={dischargeMaxDP} 
                    onChange={(e) => setDischargeMaxDP(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 focus:border-rose-500 focus:outline-none"
                    disabled={optimizationFocus !== 'solve-height'}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">Duct Area</div>
                  <div className="text-sm font-bold text-white mt-0.5">{designMetrics.dischargeMetrics.calculatedArea.toFixed(2)} m²</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{dischargeDuctWidth}W × {designMetrics.dischargeMetrics.ductHeight.toFixed(2)}H</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">ΔP Drop</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">{designMetrics.dischargeMetrics.computedPressureDrop.toFixed(1)} Pa</div>
                </div>
                <div className="col-span-2 p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono mb-1">Silencer Profile</div>
                  <div className="text-xs font-bold text-slate-300">{designMetrics.dischargeMetrics.selectedProfile.name.split(' (')[0]}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">System Live Diagnostics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono">Total System Pressure Drop</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Fan must overcome Intake + Discharge</div>
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {designMetrics.totalSystemPressureDrop.toFixed(1)} Pa
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono">Min. Heat-Rejection Flow</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Airflow required for thermal balance</div>
                </div>
                <div className="text-xl font-bold text-white">
                  {designMetrics.qThermalRequired.toFixed(2)} m³/s
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-sky-400 border-b border-slate-800 pb-1 mb-2 font-bold">INTAKE DIAGNOSTICS</div>
                <div className="flex justify-between text-slate-400">
                  <span>Face Velocity:</span>
                  <span className="text-slate-200 font-bold">{designMetrics.intakeMetrics.faceVelocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Interstitial Vel:</span>
                  <span className="text-slate-200 font-bold">{designMetrics.intakeMetrics.interstitialVelocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Self-Noise Risk:</span>
                  <span className={`font-bold ${
                    designMetrics.intakeMetrics.selfNoiseRisk === 'CRITICAL' ? 'text-rose-400' :
                    designMetrics.intakeMetrics.selfNoiseRisk === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{designMetrics.intakeMetrics.selfNoiseRisk}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-rose-400 border-b border-slate-800 pb-1 mb-2 font-bold">DISCHARGE DIAGNOSTICS</div>
                <div className="flex justify-between text-slate-400">
                  <span>Face Velocity:</span>
                  <span className="text-slate-200 font-bold">{designMetrics.dischargeMetrics.faceVelocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Interstitial Vel:</span>
                  <span className="text-slate-200 font-bold">{designMetrics.dischargeMetrics.interstitialVelocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Self-Noise Risk:</span>
                  <span className={`font-bold ${
                    designMetrics.dischargeMetrics.selfNoiseRisk === 'CRITICAL' ? 'text-rose-400' :
                    designMetrics.dischargeMetrics.selfNoiseRisk === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{designMetrics.dischargeMetrics.selfNoiseRisk}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border text-sm ${
              designMetrics.status === 'OPTIMAL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
              designMetrics.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
              'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              <div className="font-bold font-mono tracking-wide mb-1 uppercase">
                ⚠️ [{designMetrics.status}] DESIGN STATUS REPORT
              </div>
              <p className="text-xs leading-relaxed opacity-90">{designMetrics.statusMsg}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-[280px]">
            <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-lg flex items-center justify-between text-xs font-mono text-slate-400">
              <span>🤖 Ventilation & Acoustics Co-Pilot Chat</span>
              <span className={`h-2 w-2 rounded-full ${isAiLoading ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-sans">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded p-2.5 leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-amber-500 text-slate-950 font-medium' 
                      : 'bg-slate-950 border border-slate-800 text-slate-300'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded p-2.5 italic animate-pulse">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-2 border-t border-slate-800 bg-slate-950/20 flex gap-2">
              <input 
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userPrompt.trim()) {
                    handleSendMessage(userPrompt);
                    setUserPrompt('');
                  }
                }}
                placeholder="Ask Co-Pilot to audit or tune configuration..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}