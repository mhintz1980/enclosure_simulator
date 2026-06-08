import { EnclosureDimensions, VacuumPumpConfig, MountType } from '../../types';

interface EnclosurePlanViewProps {
  dimensions: EnclosureDimensions;
  vacuumPumpConfig: VacuumPumpConfig;
  mountType: MountType;
  designAirflow: number;
}

const SVG_W = 680;
const SVG_H = 340;
const PADDING = 50;

function PlanArrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  const hl = 7;
  const hw = 3.5;

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - ux * hl} y2={y2 - uy * hl} stroke={color} strokeWidth={1.8} opacity={0.8} />
      <polygon
        points={`${x2},${y2} ${x2 - ux * hl + uy * hw},${y2 - uy * hl - ux * hw} ${x2 - ux * hl - uy * hw},${y2 - uy * hl + ux * hw}`}
        fill={color} opacity={0.8}
      />
    </g>
  );
}

export function EnclosurePlanView({
  dimensions,
  vacuumPumpConfig,
  mountType,
  designAirflow,
}: EnclosurePlanViewProps) {
  const drawW = SVG_W - PADDING * 2;
  const drawH = SVG_H - PADDING * 2;
  const scaleX = drawW / Math.max(dimensions.length, 0.5);
  const scaleY = drawH / Math.max(dimensions.width, 0.5);
  const scale = Math.min(scaleX, scaleY) * 0.7;

  const encW = dimensions.length * scale; // left-right = length
  const encH = dimensions.width * scale;  // top-bottom = width
  const encX = (SVG_W - encW) / 2;
  const encY = (SVG_H - encH) / 2;

  const hasVacPump = vacuumPumpConfig.type !== 'none';

  // Component positions (top-down view)
  const pumpW = encW * 0.14;
  const pumpH = encH * 0.28;
  const pumpX = encX + encW * 0.22;
  const pumpY = encY + (encH - pumpH) / 2;

  const radW = encW * 0.04;
  const radH = encH * 0.70;
  const radX = encX + encW - radW - encW * 0.06;
  const radY = encY + (encH - radH) / 2;

  const engineW = encW * 0.20;
  const engineH = encH * 0.40;
  const engineX = radX - engineW - encW * 0.02;
  const engineY = encY + (encH - engineH) / 2;

  const vacW = encW * 0.10;
  const vacH = encH * 0.20;
  const vacX = pumpX + pumpW + encW * 0.03;
  const vacY = encY + encH * 0.15;

  // Intake opening (left wall)
  const intakeOpenH = encH * 0.5;
  const intakeOpenY = encY + (encH - intakeOpenH) / 2;

  // Exhaust opening (right wall)
  const exhaustOpenH = encH * 0.5;
  const exhaustOpenY = encY + (encH - exhaustOpenH) / 2;

  // Door hinges (top and bottom walls)
  const doorW = encW * 0.25;

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Enclosure Plan View — Top Down (Inlet Left → Exhaust Right)
      </p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto">
        {/* Enclosure outline */}
        <rect x={encX} y={encY} width={encW} height={encH} fill="#0f172a" fillOpacity={0.4} stroke="#475569" strokeWidth={2} rx={3} />

        {/* Hinged door panels (top wall) */}
        <line x1={encX + encW * 0.35} y1={encY} x2={encX + encW * 0.35} y2={encY - 4} stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={encX + encW * 0.35 + doorW} y1={encY} x2={encX + encW * 0.35 + doorW} y2={encY - 4} stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={encX + encW * 0.35} y1={encY - 4} x2={encX + encW * 0.35 + doorW} y2={encY - 4} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />
        <text x={encX + encW * 0.35 + doorW / 2} y={encY - 8} fill="#64748b" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">DOOR PANEL</text>

        {/* Hinged door panels (bottom wall) */}
        <line x1={encX + encW * 0.35} y1={encY + encH} x2={encX + encW * 0.35} y2={encY + encH + 4} stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={encX + encW * 0.35 + doorW} y1={encY + encH} x2={encX + encW * 0.35 + doorW} y2={encY + encH + 4} stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={encX + encW * 0.35} y1={encY + encH + 4} x2={encX + encW * 0.35 + doorW} y2={encY + encH + 4} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />
        <text x={encX + encW * 0.35 + doorW / 2} y={encY + encH + 14} fill="#64748b" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">DOOR PANEL</text>

        {/* Intake opening highlight */}
        <rect x={encX - 2} y={intakeOpenY} width={4} height={intakeOpenH} fill="#38bdf8" rx={1} />
        <text x={encX - 8} y={intakeOpenY + intakeOpenH / 2 + 3} fill="#38bdf8" fontSize={8} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="bold">INLET</text>

        {/* Exhaust opening highlight */}
        <rect x={encX + encW - 2} y={exhaustOpenY} width={4} height={exhaustOpenH} fill="#fb7185" rx={1} />
        <text x={encX + encW + 8} y={exhaustOpenY + exhaustOpenH / 2 + 3} fill="#fb7185" fontSize={8} textAnchor="start" fontFamily="JetBrains Mono, monospace" fontWeight="bold">EXHAUST</text>

        {/* Main pump */}
        <rect x={pumpX} y={pumpY} width={pumpW} height={pumpH} fill="#818cf8" fillOpacity={0.2} stroke="#818cf8" strokeWidth={1.5} rx={3} />
        <text x={pumpX + pumpW / 2} y={pumpY + pumpH / 2 + 3} fill="#a5b4fc" fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">PUMP</text>

        {/* Engine */}
        <rect x={engineX} y={engineY} width={engineW} height={engineH} fill="#64748b" fillOpacity={0.25} stroke="#94a3b8" strokeWidth={1.5} rx={3} />
        <text x={engineX + engineW / 2} y={engineY + engineH / 2 + 3} fill="#e2e8f0" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">ENGINE</text>

        {/* Vacuum pump */}
        {hasVacPump && (
          <g>
            <rect x={vacX} y={vacY} width={vacW} height={vacH} fill="#c084fc" fillOpacity={0.2} stroke="#c084fc" strokeWidth={1.5} rx={3} />
            <text x={vacX + vacW / 2} y={vacY + vacH / 2 + 3} fill="#d8b4fe" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">VAC PUMP</text>
          </g>
        )}

        {/* Radiator */}
        <rect x={radX} y={radY} width={radW} height={radH} fill="#fb7185" fillOpacity={0.15} stroke="#fb7185" strokeWidth={1.5} rx={2} />
        {/* Radiator fin lines */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((f, i) => (
          <line key={`prf-${i}`}
            x1={radX + 2} y1={radY + radH * f}
            x2={radX + radW - 2} y2={radY + radH * f}
            stroke="#fb7185" strokeWidth={0.5} opacity={0.4}
          />
        ))}
        <text x={radX + radW / 2} y={radY - 5} fill="#fb7185" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">RAD</text>

        {/* ── AIRFLOW ARROWS (horizontal through-flow) ── */}

        {/* Intake arrows entering enclosure */}
        <PlanArrow x1={encX - 24} y1={encY + encH * 0.38} x2={encX + 2} y2={encY + encH * 0.38} color="#38bdf8" />
        <PlanArrow x1={encX - 24} y1={encY + encH * 0.50} x2={encX + 2} y2={encY + encH * 0.50} color="#38bdf8" />
        <PlanArrow x1={encX - 24} y1={encY + encH * 0.62} x2={encX + 2} y2={encY + encH * 0.62} color="#38bdf8" />

        {/* Internal flow arrows: intake → pump */}
        <PlanArrow x1={encX + encW * 0.12} y1={encY + encH * 0.35} x2={pumpX - 6} y2={encY + encH * 0.40} color="#7dd3fc" />
        <PlanArrow x1={encX + encW * 0.12} y1={encY + encH * 0.65} x2={pumpX - 6} y2={encY + encH * 0.60} color="#7dd3fc" />

        {/* Pump → engine */}
        <PlanArrow x1={pumpX + pumpW + 4} y1={encY + encH * 0.42} x2={engineX - 6} y2={encY + encH * 0.42} color="#fbbf24" />
        <PlanArrow x1={pumpX + pumpW + 4} y1={encY + encH * 0.58} x2={engineX - 6} y2={encY + encH * 0.58} color="#fbbf24" />

        {/* Engine → radiator */}
        <PlanArrow x1={engineX + engineW + 4} y1={encY + encH * 0.42} x2={radX - 6} y2={encY + encH * 0.42} color="#f97316" />
        <PlanArrow x1={engineX + engineW + 4} y1={encY + encH * 0.58} x2={radX - 6} y2={encY + encH * 0.58} color="#f97316" />

        {/* Radiator → exhaust */}
        <PlanArrow x1={radX + radW + 4} y1={encY + encH * 0.38} x2={encX + encW - 3} y2={encY + encH * 0.38} color="#f97316" />
        <PlanArrow x1={radX + radW + 4} y1={encY + encH * 0.50} x2={encX + encW - 3} y2={encY + encH * 0.50} color="#f97316" />
        <PlanArrow x1={radX + radW + 4} y1={encY + encH * 0.62} x2={encX + encW - 3} y2={encY + encH * 0.62} color="#f97316" />

        {/* Exhaust arrows leaving enclosure */}
        <PlanArrow x1={encX + encW + 2} y1={encY + encH * 0.38} x2={encX + encW + 24} y2={encY + encH * 0.38} color="#fb7185" />
        <PlanArrow x1={encX + encW + 2} y1={encY + encH * 0.50} x2={encX + encW + 24} y2={encY + encH * 0.50} color="#fb7185" />
        <PlanArrow x1={encX + encW + 2} y1={encY + encH * 0.62} x2={encX + encW + 24} y2={encY + encH * 0.62} color="#fb7185" />

        {/* Dimension annotations */}
        {/* Length (horizontal) */}
        <line x1={encX} y1={encY + encH + 22} x2={encX + encW} y2={encY + encH + 22} stroke="#64748b" strokeWidth={0.8} />
        <line x1={encX} y1={encY + encH + 18} x2={encX} y2={encY + encH + 26} stroke="#64748b" strokeWidth={0.8} />
        <line x1={encX + encW} y1={encY + encH + 18} x2={encX + encW} y2={encY + encH + 26} stroke="#64748b" strokeWidth={0.8} />
        <text x={encX + encW / 2} y={encY + encH + 34} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace">{dimensions.length.toFixed(1)}m</text>

        {/* Width (vertical) */}
        <line x1={encX + encW + 22} y1={encY} x2={encX + encW + 22} y2={encY + encH} stroke="#64748b" strokeWidth={0.8} />
        <line x1={encX + encW + 18} y1={encY} x2={encX + encW + 26} y2={encY} stroke="#64748b" strokeWidth={0.8} />
        <line x1={encX + encW + 18} y1={encY + encH} x2={encX + encW + 26} y2={encY + encH} stroke="#64748b" strokeWidth={0.8} />
        <text x={encX + encW + 36} y={encY + encH / 2 + 3} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace" transform={`rotate(90, ${encX + encW + 36}, ${encY + encH / 2})`}>{dimensions.width.toFixed(1)}m</text>

        {/* Mount type label */}
        <text x={SVG_W / 2} y={SVG_H - 6} fill="#64748b" fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          {mountType === 'trailer' ? '🚛 Trailer Mounted' : mountType === 'skid' ? '⬛ Skid Mounted' : '🏗️ Stationary'} — Airflow: {designAirflow.toFixed(2)} m³/s
        </text>
      </svg>

      <div className="flex justify-center gap-4 mt-1 text-[9px] font-mono text-slate-500">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-sky-400" /> Intake</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Internal Flow</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-rose-400" /> Exhaust</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-indigo-400 rounded-sm" /> Pump</span>
        {hasVacPump && <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-purple-400 rounded-sm" /> Vac Pump</span>}
      </div>
    </div>
  );
}
