import { EnclosureDimensions, VacuumPumpConfig, MountType, DuctMetrics } from '../../types';

interface EnclosureCrossSectionProps {
  dimensions: EnclosureDimensions;
  intakeMetrics: DuctMetrics;
  dischargeMetrics: DuctMetrics;
  vacuumPumpConfig: VacuumPumpConfig;
  mountType: MountType;
  designAirflow: number;
}

// SVG scaling
const PADDING = 40;
const SVG_W = 680;
const SVG_H = 380;

function Arrow({ x1, y1, x2, y2, color, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color: string; dashed?: boolean }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  const headLen = 8;
  const headW = 4;

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2 - ux * headLen} y2={y2 - uy * headLen}
        stroke={color} strokeWidth={2} strokeDasharray={dashed ? '6 3' : 'none'} opacity={0.85}
      />
      <polygon
        points={`${x2},${y2} ${x2 - ux * headLen + uy * headW},${y2 - uy * headLen - ux * headW} ${x2 - ux * headLen - uy * headW},${y2 - uy * headLen + ux * headW}`}
        fill={color} opacity={0.85}
      />
    </g>
  );
}

export function EnclosureCrossSection({
  dimensions,
  vacuumPumpConfig,
  mountType,
  designAirflow,
}: EnclosureCrossSectionProps) {
  // Scale enclosure to fit SVG
  const drawW = SVG_W - PADDING * 2;
  const drawH = SVG_H - PADDING * 2 - 30; // room for mount
  const scaleX = drawW / Math.max(dimensions.length, 0.5);
  const scaleY = drawH / Math.max(dimensions.height, 0.5);
  const scale = Math.min(scaleX, scaleY) * 0.75;

  const encW = dimensions.length * scale;
  const encH = dimensions.height * scale;
  const encX = (SVG_W - encW) / 2;
  const encY = PADDING + 10;

  // Component positions (intake left → pump center-left → engine center-right → radiator right → exhaust right)
  const pumpW = encW * 0.12;
  const pumpH = encH * 0.30;
  const pumpX = encX + encW * 0.22;
  const pumpY = encY + encH - pumpH - encH * 0.08;

  const radW = encW * 0.06;
  const radH = encH * 0.70;
  const radX = encX + encW - radW - encW * 0.08;
  const radY = encY + (encH - radH) / 2;

  const engineW = encW * 0.18;
  const engineH = encH * 0.45;
  const engineX = radX - engineW - encW * 0.02;
  const engineY = encY + encH - engineH - encH * 0.08;

  const hasVacPump = vacuumPumpConfig.type !== 'none';
  const vacW = encW * 0.10;
  const vacH = encH * 0.22;
  const vacX = pumpX + pumpW + encW * 0.03;
  const vacY = encY + encH - vacH - encH * 0.08;

  // Intake silencer (left side)
  const silIntakeW = encW * 0.08;
  const silIntakeH = encH * 0.55;
  const silIntakeX = encX + encW * 0.02;
  const silIntakeY = encY + (encH - silIntakeH) / 2;

  // Discharge silencer (right side, after radiator)
  const silDischargeW = encW * 0.08;
  const silDischargeH = encH * 0.55;
  const silDischargeX = encX + encW - silDischargeW - encW * 0.01;
  const silDischargeY = encY + (encH - silDischargeH) / 2;

  // Mount
  const mountY = encY + encH;
  const mountH = 16;

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Enclosure Cross-Section — Side View (Cool Air ➜ Hot Exhaust)
      </p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto">
        <defs>
          {/* Cool-to-hot gradient for temperature visualization */}
          <linearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Enclosure body */}
        <rect x={encX} y={encY} width={encW} height={encH} fill="url(#tempGrad)" stroke="#475569" strokeWidth={2} rx={4} />

        {/* Temperature zone labels */}
        <text x={encX + 12} y={encY + 14} fill="#38bdf8" fontSize={8} fontFamily="JetBrains Mono, monospace" opacity={0.7}>COOL ZONE</text>
        <text x={encX + encW - 70} y={encY + 14} fill="#fb7185" fontSize={8} fontFamily="JetBrains Mono, monospace" opacity={0.7}>HOT ZONE</text>

        {/* Intake silencer (tortuous path baffles) */}
        <rect x={silIntakeX} y={silIntakeY} width={silIntakeW} height={silIntakeH} fill="#38bdf8" fillOpacity={0.12} stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3 2" rx={2} />
        {/* Baffle lines inside intake silencer */}
        {[0.2, 0.4, 0.6, 0.8].map((frac, i) => (
          <line
            key={`ib-${i}`}
            x1={silIntakeX + silIntakeW * frac} y1={silIntakeY + 3}
            x2={silIntakeX + silIntakeW * frac} y2={silIntakeY + silIntakeH - 3}
            stroke="#38bdf8" strokeWidth={1} opacity={0.5}
          />
        ))}
        <text x={silIntakeX + silIntakeW / 2} y={silIntakeY - 5} fill="#38bdf8" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          INTAKE SILENCER
        </text>

        {/* Main pump */}
        <rect x={pumpX} y={pumpY} width={pumpW} height={pumpH} fill="#818cf8" fillOpacity={0.2} stroke="#818cf8" strokeWidth={1.5} rx={3} />
        <text x={pumpX + pumpW / 2} y={pumpY + pumpH / 2 + 3} fill="#a5b4fc" fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">PUMP</text>

        {/* Engine block */}
        <rect x={engineX} y={engineY} width={engineW} height={engineH} fill="#64748b" fillOpacity={0.3} stroke="#94a3b8" strokeWidth={1.5} rx={3} />
        <text x={engineX + engineW / 2} y={engineY + engineH / 2 - 6} fill="#e2e8f0" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">ENGINE</text>
        <text x={engineX + engineW / 2} y={engineY + engineH / 2 + 6} fill="#94a3b8" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">🔥 Heat Source</text>

        {/* Vacuum pump (if present) */}
        {hasVacPump && (
          <g>
            <rect x={vacX} y={vacY} width={vacW} height={vacH} fill="#c084fc" fillOpacity={0.2} stroke="#c084fc" strokeWidth={1.5} rx={3} />
            <text x={vacX + vacW / 2} y={vacY + vacH / 2 - 4} fill="#d8b4fe" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">VAC</text>
            <text x={vacX + vacW / 2} y={vacY + vacH / 2 + 6} fill="#d8b4fe" fontSize={6} textAnchor="middle" fontFamily="JetBrains Mono, monospace">PUMP</text>
          </g>
        )}

        {/* Radiator */}
        <rect x={radX} y={radY} width={radW} height={radH} fill="#fb7185" fillOpacity={0.15} stroke="#fb7185" strokeWidth={1.5} rx={2} />
        {/* Radiator fins */}
        {[0.15, 0.30, 0.45, 0.60, 0.75, 0.85].map((frac, i) => (
          <line
            key={`rf-${i}`}
            x1={radX + 2} y1={radY + radH * frac}
            x2={radX + radW - 2} y2={radY + radH * frac}
            stroke="#fb7185" strokeWidth={0.8} opacity={0.5}
          />
        ))}
        <text x={radX + radW / 2} y={radY - 5} fill="#fb7185" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">RAD</text>

        {/* Discharge silencer (tortuous path baffles) */}
        <rect x={silDischargeX} y={silDischargeY} width={silDischargeW} height={silDischargeH} fill="#fb7185" fillOpacity={0.12} stroke="#fb7185" strokeWidth={1.5} strokeDasharray="3 2" rx={2} />
        {[0.2, 0.4, 0.6, 0.8].map((frac, i) => (
          <line
            key={`db-${i}`}
            x1={silDischargeX + silDischargeW * frac} y1={silDischargeY + 3}
            x2={silDischargeX + silDischargeW * frac} y2={silDischargeY + silDischargeH - 3}
            stroke="#fb7185" strokeWidth={1} opacity={0.5}
          />
        ))}
        <text x={silDischargeX + silDischargeW / 2} y={silDischargeY - 5} fill="#fb7185" fontSize={7} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          EXHAUST SILENCER
        </text>

        {/* ── AIRFLOW ARROWS ── */}

        {/* Cool air entering from left */}
        <Arrow x1={encX - 30} y1={encY + encH * 0.35} x2={encX - 2} y2={encY + encH * 0.35} color="#38bdf8" />
        <Arrow x1={encX - 30} y1={encY + encH * 0.55} x2={encX - 2} y2={encY + encH * 0.55} color="#38bdf8" />
        <text x={encX - 34} y={encY + encH * 0.45 + 3} fill="#38bdf8" fontSize={8} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          COOL AIR IN
        </text>

        {/* Air through intake silencer */}
        <Arrow x1={silIntakeX + silIntakeW + 4} y1={encY + encH * 0.40} x2={pumpX - 8} y2={encY + encH * 0.40} color="#7dd3fc" dashed />
        <Arrow x1={silIntakeX + silIntakeW + 4} y1={encY + encH * 0.55} x2={pumpX - 8} y2={encY + encH * 0.55} color="#7dd3fc" dashed />

        {/* Air flowing past pump → engine → radiator */}
        <Arrow x1={pumpX + pumpW + 4} y1={encY + encH * 0.45} x2={engineX - 6} y2={encY + encH * 0.45} color="#fbbf24" dashed />
        <Arrow x1={engineX + engineW + 4} y1={encY + encH * 0.45} x2={radX - 6} y2={encY + encH * 0.45} color="#fbbf24" dashed />

        {/* Hot air through radiator → discharge */}
        <Arrow x1={radX + radW + 4} y1={encY + encH * 0.40} x2={silDischargeX - 4} y2={encY + encH * 0.40} color="#f97316" dashed />
        <Arrow x1={radX + radW + 4} y1={encY + encH * 0.55} x2={silDischargeX - 4} y2={encY + encH * 0.55} color="#f97316" dashed />

        {/* Hot air exiting right */}
        <Arrow x1={encX + encW + 2} y1={encY + encH * 0.35} x2={encX + encW + 30} y2={encY + encH * 0.35} color="#fb7185" />
        <Arrow x1={encX + encW + 2} y1={encY + encH * 0.55} x2={encX + encW + 30} y2={encY + encH * 0.55} color="#fb7185" />
        <text x={encX + encW + 34} y={encY + encH * 0.45 + 3} fill="#fb7185" fontSize={8} textAnchor="start" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          HOT AIR OUT
        </text>

        {/* Mount / base */}
        <rect x={encX - 8} y={mountY} width={encW + 16} height={mountH} fill="#334155" fillOpacity={0.5} stroke="#475569" strokeWidth={1} rx={2} />
        <text x={SVG_W / 2} y={mountY + mountH / 2 + 3} fill="#64748b" fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          {mountType === 'trailer' ? '🚛 TRAILER FRAME' : mountType === 'skid' ? '⬛ SKID BASE' : '🏗️ STATIONARY BASE'}
        </text>

        {/* Dimension labels */}
        <text x={SVG_W / 2} y={mountY + mountH + 14} fill="#64748b" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          {dimensions.length.toFixed(1)}m L × {dimensions.width.toFixed(1)}m W × {dimensions.height.toFixed(1)}m H
        </text>

        {/* Airflow value label */}
        <text x={SVG_W / 2} y={encY + encH + mountH + 28} fill="#94a3b8" fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          Design Airflow: {designAirflow.toFixed(2)} m³/s
        </text>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[9px] font-mono text-slate-500">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-sky-400" /> Cool Air Intake</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Warming Air</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-rose-400" /> Hot Exhaust</span>
        {hasVacPump && <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-purple-400" /> Vacuum Pump</span>}
      </div>
    </div>
  );
}
