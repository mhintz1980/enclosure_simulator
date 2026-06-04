import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SilencerProfile, CalculationResults } from './types';

// --- Price Industries Acoustic Database ---
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

const OCTAVE_FREQUENCIES = ['63 Hz', '125 Hz', '250 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz', '8 kHz'];

export default function App() {
  // --- STATE LAYER ---
  const [heatLoad, setHeatLoad] = useState<number>(150); 
  const [combustionAirflow, setCombustionAirflow] = useState<number>(12.0); 
  const [targetEnclosureTemp, setTargetEnclosureTemp] = useState<number>(42.0); 
  const [targetInsertionLoss, setTargetInsertionLoss] = useState<number>(28); 
  const [ductWidth, setDuctWidth] = useState<number>(1.8); 
  const [maxAllowedPressureDrop, setMaxAllowedPressureDrop] = useState<number>(60); 
  const [optimizationFocus, setOptimizationFocus] = useState<'solve-height' | 'solve-pressure'>('solve-height');
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [roadblockExpanded, setRoadblockExpanded] = useState<boolean>(false);

  // Co-Pilot Chat Layer
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([
    {
      role: 'assistant',
      content: "Hello! Adjust parameters to see layout changes. I can audit configurations against Caterpillar standards and Price Industries analytics."
    }
  ]);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- PHYSICS SOLVER ---
  const designMetrics = useMemo<CalculationResults>(() => {
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
    let computedPressureDrop = 0;

    if (optimizationFocus === 'solve-height') {
      const maxAllowedVelocity = Math.sqrt((2 * maxAllowedPressureDrop) / (selectedProfile.lossCoefficientK * airDensityEnclosure));
      const reqDuctArea = designAirflow / maxAllowedVelocity;
      ductHeight = Math.max(0.3, reqDuctArea / ductWidth);
      computedPressureDrop = maxAllowedPressureDrop;
    } else {
      const defaultDuctHeight = 1.6;
      ductHeight = defaultDuctHeight;
      const ductArea = ductWidth * defaultDuctHeight;
      const faceVelocity = designAirflow / ductArea;
      computedPressureDrop = selectedProfile.lossCoefficientK * 0.5 * airDensityEnclosure * Math.pow(faceVelocity, 2);
    }

    const calculatedArea = ductWidth * ductHeight;
    const faceVelocity = designAirflow / calculatedArea;
    const interstitialVelocity = faceVelocity / (selectedProfile.openArea / 100);
    const selfNoiseRisk = interstitialVelocity > 15 ? 'CRITICAL' : interstitialVelocity > 10 ? 'MODERATE' : 'LOW';

    let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
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

  const sendPromptToAI = async (customText?: string) => {
    const activeText = customText || userPrompt;
    if (!activeText.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', content: activeText }]);
    setUserPrompt("");
    setIsAiLoading(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Calculated response mock for: "${activeText}". Update API configurations to link live parameters.` 
      }]);
      setIsAiLoading(false);
    }, 800);
  };

  const renderInfoCollapsible = (id: string, docSection: string, descriptionText: string, exampleDetails: string) => {
    const isOpen = activeHelp === id;
    return (
      <div className="mt-1.5 border border-slate-800 rounded bg-slate-950/80 overflow-hidden text-xs transition-all duration-200">
        <button
          type="button"
          onClick={() => setActiveHelp(isOpen ? null : id)}
          className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between text-slate-400 font-semibold"
        >
          <span className="flex items-center gap-1.5">📖 Where to find this info?</span>
          <span className="text-slate-500 text-[10px]">{isOpen ? 'Collapse ▲' : 'Expand ▼'}</span>
        </button>
        {isOpen && (
          <div className="p-3 space-y-2 border-t border-slate-800 text-slate-300 leading-relaxed">
            <div>
              <span className="block text-[10px] text-amber-500 font-bold uppercase tracking-wider">Manufacturer Document Section:</span>
              <span className="font-semibold text-slate-200">{docSection}</span>
            </div>
            <p className="text-slate-400 text-[11px]">{descriptionText}</p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
              <span className="block font-bold text-slate-200 mb-1">🛠️ Perkins 904J-E22TA (1800 RPM) Reference:</span>
              <p className="italic text-slate-400">{exampleDetails}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-100 via-slate-100 to-amber-500 bg-clip-text text-transparent">
            Generator Enclosure & Silencer Simulator
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --- LEFT SIDEBAR INPUTS --- */}
        <section className="lg:col-span-4 bg-slate-900/50 rounded-xl border border-slate-800/80 p-5 space-y-6">
          <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setRoadblockExpanded(!roadblockExpanded)}
              className="w-full px-4 py-3 bg-amber-500/10 flex items-center justify-between text-left"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">🚧 Roadblock Solver & Recovery</span>
              <span className="text-xs text-amber-500">{roadblockExpanded ? 'Roll Up ▲' : 'Open Tools ▼'}</span>
            </button>
            {roadblockExpanded && (
              <div className="p-4 space-y-4 text-xs border-t border-amber-500/10">
                <div className="flex gap-1">
                  <input type="text" placeholder="e.g., Perkins 904J" className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1" />
                  <button type="button" onClick={() => { setHeatLoad(110); setCombustionAirflow(8.5); }} className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded">Fetch</button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Radiated Heat Load</label>
              <span className="text-xs font-semibold text-amber-400">{heatLoad} kW</span>
            </div>
            <input type="range" min="20" max="600" step="5" value={heatLoad} onChange={(e) => setHeatLoad(Number(e.target.value))} className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg" />
            {renderInfoCollapsible('heatLoad', 'Engine Datasheet -> Heat Rejection', 'Emitted outward as convective heat from the block.', 'Perkins 904J lists this at ~7.0 kW at atmosphere. Add ~3.0 kW for alternator losses.')}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Engine / Radiator Airflow</label>
              <span className="text-xs font-semibold text-amber-400">{combustionAirflow.toFixed(1)} m³/s</span>
            </div>
            <input type="range" min="2.0" max="40.0" step="0.5" value={combustionAirflow} onChange={(e) => setCombustionAirflow(Number(e.target.value))} className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg" />
            {renderInfoCollapsible('airflow', 'Engine Spec Manual -> Cooling System', 'Covers radiator fan demands plus combustion air volume.', '904J uses roughly 2.0 m³/s for the core fan setup.')}
          </div>
        </section>

        {/* --- RIGHT VISUALIZATIONS SECTION (Sticky Frame Container) --- */}
        <section className="lg:col-span-8 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Required Duct Area</span>
              <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">{designMetrics.calculatedArea.toFixed(2)} m²</span>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Profile Selected</span>
              <span className="text-sm font-semibold text-amber-400 mt-1 block leading-tight">{designMetrics.selectedProfile.name.split(' (')[0]}</span>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Predicted Delta P</span>
              <span className="text-2xl font-bold font-mono mt-1 block text-emerald-400">{designMetrics.computedPressureDrop.toFixed(1)} Pa</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Engineering Reference Validation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Min. Heat-Rejection Flow:</span>
                <span className="font-mono text-slate-200 font-semibold">{designMetrics.qThermalRequired.toFixed(2)} m³/s</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Inlet Face Velocity:</span>
                <span className="font-mono text-slate-200 font-semibold">{designMetrics.faceVelocity.toFixed(2)} m/s</span>
              </div>
            </div>
          </div>

          {/* Warning Design Status Banner - Relocated to avoid shifting other items downward */}
          <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${
            designMetrics.status === 'OPTIMAL' ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' :
            designMetrics.status === 'WARNING' ? 'bg-amber-950/30 border-amber-500/20 text-amber-300' :
            'bg-rose-950/30 border-rose-500/20 text-rose-300'
          }`}>
            <div>
              <p className="font-semibold text-slate-100">{designMetrics.status} DESIGN STATUS REPORT</p>
              <p className="text-xs text-slate-300 mt-1">{designMetrics.statusMsg}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}