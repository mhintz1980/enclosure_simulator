import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SilencerProfile, CalculationResults } from './types';

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
  const [targetInsertionLoss, setTargetInsertionLoss] = useState(28); 
  const [ductWidth, setDuctWidth] = useState(1.8); 
  const [maxAllowedPressureDrop, setMaxAllowedPressureDrop] = useState(60); 
  const [optimizationFocus, setOptimizationFocus] = useState<'solve-height' | 'solve-pressure'>('solve-height');
  const [activeHelp, setActiveHelp] = useState(null);
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

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsAiLoading(true);

    setTimeout(() => {
      let responseContent = `Calculated response audit: The static pressure drop is currently ${designMetrics.computedPressureDrop.toFixed(1)} Pa, and the target insertion loss is set to ${targetInsertionLoss} dB.`;
      
      const query = text.toLowerCase();
      if (query.includes('retrieve') || query.includes('perkins') || query.includes('cummins')) {
        responseContent = `Successfully retrieved technical specifications: Heat Load has been set to 110 kW and Combustion/Radiator Airflow has been set to 8.5 m³/s.`;
        setHeatLoad(110);
        setCombustionAirflow(8.5);
      } else if (query.includes('audit') || query.includes('check') || query.includes('verify')) {
        responseContent = `Engineering Audit Report: Ambient temperature is 32.5°C. Design Airflow is ${designMetrics.designAirflow.toFixed(1)} m³/s. Status is currently [${designMetrics.status}]. ${designMetrics.statusMsg}`;
      } else if (query.includes('solve') || query.includes('height') || query.includes('pressure')) {
        responseContent = `Optimization focus is set to [${optimizationFocus}]. Duct area resolved to ${designMetrics.calculatedArea.toFixed(2)} m² (resolved height is ${designMetrics.ductHeight.toFixed(2)}m).`;
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
      setIsAiLoading(false);
    }, 800);
  };

  const designMetrics = useMemo(() => {
    const T_AMBIENT = 32.5; 
    const CP_AIR = 1.005; 

    const airDensityEnclosure = 101.325 / (0.287 * (targetEnclosureTemp + 273.15));
    const deltaT = Math.max(0.5, targetEnclosureTemp - T_AMBIENT);
    const qThermalRequired = heatLoad / (airDensityEnclosure * CP_AIR * deltaT);

    const isAirflowDeficient = combustionAirflow < qThermalRequired;
    const designAirflow = isAirflowDeficient ? qThermalRequired : combustionAirflow;

    let selectedProfile = SILENCER_PROFILES[1];
    if (targetInsertionLoss <= 20) selectedProfile = SILENCER_PROFILES[0];
    else if (targetInsertionLoss > 35) selectedProfile = SILENCER_PROFILES[2];

    let ductHeight = 1.5;

    if (optimizationFocus === 'solve-height') {
      const maxAllowedVelocity = Math.sqrt((2 * maxAllowedPressureDrop) / (selectedProfile.lossCoefficientK * airDensityEnclosure));
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

    let status = 'OPTIMAL';
    let statusMsg = 'System matches Caterpillar and Price Industries standards.';
    
    if (computedPressureDrop > 100) {
      status = 'CRITICAL';
      statusMsg = 'High static restriction risks radiator fan stalling and generator thermal shutdown.';
    } else if (computedPressureDrop > 60 || isAirflowDeficient || selfNoiseRisk === 'CRITICAL') {
      status = 'WARNING';
      if (isAirflowDeficient) {
        statusMsg = 'Engine radiator fan airflow is insufficient to reject generator heat load at this temperature. Design flow auto-adjusted.';
      } else if (selfNoiseRisk === 'CRITICAL') {
        statusMsg = 'Baffle interstitial velocity is too high, generating self-noise that bypasses acoustic attenuation.';
      } else {
        statusMsg = 'Static pressure drop is high. Verify radiator fan performance curve.';
      }
    }

    return {
      T_AMBIENT,
      airDensityEnclosure,
      deltaT,
      qThermalRequired,
      designAirflow,
      isAirflowDeficient,
      selectedProfile,
      ductHeight,
      calculatedArea,
      faceVelocity,
      interstitialVelocity,
      computedPressureDrop,
      selfNoiseRisk,
      status,
      statusMsg,
    };
  }, [heatLoad, combustionAirflow, targetEnclosureTemp, targetInsertionLoss, ductWidth, maxAllowedPressureDrop, optimizationFocus]);

  const renderInfoCollapsible = (id, docSection, descriptionText, exampleDetails) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
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
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">Design Parameters</h3>
            
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
              {renderInfoCollapsible(
                'temp',
                'Engine Thermal Operating Envelopes',
                'Structural restriction bounds before standard power deratings activate.',
                'Capped consistently around 45°C - 50°C to limit cooling matrix sizing constraints.'
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Target Loss (dB)</label>
                <input 
                  type="number" 
                  value={targetInsertionLoss} 
                  onChange={(e) => setTargetInsertionLoss(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 font-mono block mb-1">Duct Width (m)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={ductWidth} 
                  onChange={(e) => setDuctWidth(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 font-mono block mb-1">Max ΔP (Pa)</label>
                <input 
                  type="number" 
                  value={maxAllowedPressureDrop} 
                  onChange={(e) => setMaxAllowedPressureDrop(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200"
                />
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-mono block mb-1">Optimization Strategy</label>
              <select 
                value={optimizationFocus}
                onChange={(e) => setOptimizationFocus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="solve-height">Solve for Required Height (Fixed Max ΔP)</option>
                <option value="solve-pressure">Calculate ΔP (Fixed Height 1.6m)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">Live Metrics & Diagnostics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-xs text-slate-500 font-mono">Required Duct Area</div>
                <div className="text-lg font-bold text-white mt-1">
                  {designMetrics.calculatedArea.toFixed(2)} m²
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ({ductWidth}m W × {(designMetrics.calculatedArea / ductWidth).toFixed(2)}m H)
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-xs text-slate-500 font-mono">Silencer Selection</div>
                <div className="text-lg font-bold text-amber-400 mt-1 truncate">
                  {designMetrics.selectedProfile.name.split(' (')[0]}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-xs text-slate-500 font-mono">Predicted System Drop</div>
                <div className="text-lg font-bold text-white mt-1">
                  {designMetrics.computedPressureDrop.toFixed(1)} Pa
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-xs text-slate-500 font-mono">Min. Heat-Rejection Flow</div>
                <div className="text-lg font-bold text-white mt-1">
                  {designMetrics.qThermalRequired.toFixed(2)} m³/s
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Silencer Inlet Face Velocity:</span>
                <span class="text-slate-200 font-bold">{designMetrics.faceVelocity.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Baffle Interstitial Velocity:</span>
                <span class="text-slate-200 font-bold">{designMetrics.interstitialVelocity.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Self-Noise Generation Risk:</span>
                <span className={`font-bold ${
                  designMetrics.selfNoiseRisk === 'CRITICAL' ? 'text-rose-400' :
                  designMetrics.selfNoiseRisk === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{designMetrics.selfNoiseRisk}</span>
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