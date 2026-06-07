import { DuctMetrics } from '../../types';

interface DuctCrossSectionProps {
  intakeMetrics: DuctMetrics;
  dischargeMetrics: DuctMetrics;
  intakeDuctWidth: number;
  dischargeDuctWidth: number;
}

const SCALE = 80; // px per metre for height axis
const WIDTH_SCALE = 60; // px per metre for width

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

interface BaffleViewProps {
  metrics: DuctMetrics;
  ductWidth: number;
  color: string;
  label: string;
}

function BaffleView({ metrics, ductWidth, color, label }: BaffleViewProps) {
  const profile = metrics.selectedProfile;

  // Scale to SVG coords (cap display for extreme values)
  const svgWidth = clamp(ductWidth * WIDTH_SCALE, 80, 140);
  const svgHeight = clamp(metrics.ductHeight * SCALE, 40, 160);
  const totalSvgH = svgHeight + 48; // room for labels

  // Baffle display: show 2 baffles + 1 airway between them (simplified cross-section)
  const baffleW = clamp((profile.baffleThickness / 1000) * WIDTH_SCALE, 8, 24);
  const airwayW = clamp((profile.airwayWidth / 1000) * WIDTH_SCALE, 10, 40);
  const unitCell = baffleW + airwayW;
  const numCells = Math.floor(svgWidth / unitCell) || 1;

  const riskColor = metrics.selfNoiseRisk === 'CRITICAL'
    ? '#fb7185'
    : metrics.selfNoiseRisk === 'MODERATE'
    ? '#fbbf24'
    : '#34d399';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-[10px] font-mono font-bold uppercase tracking-wider`} style={{ color }}>
        {label}
      </div>
      <svg
        width={svgWidth + 24}
        height={totalSvgH}
        viewBox={`0 0 ${svgWidth + 24} ${totalSvgH}`}
        className="overflow-visible"
      >
        {/* Duct outer border */}
        <rect
          x={12}
          y={8}
          width={svgWidth}
          height={svgHeight}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          rx={2}
        />

        {/* Baffles */}
        {Array.from({ length: numCells }).map((_, i) => {
          const x = 12 + i * unitCell;
          return (
            <g key={i}>
              {/* Baffle block */}
              <rect
                x={x}
                y={8}
                width={baffleW}
                height={svgHeight}
                fill={color}
                fillOpacity={0.25}
                stroke={color}
                strokeWidth={0.5}
              />
              {/* Airway */}
              <rect
                x={x + baffleW}
                y={8}
                width={Math.min(airwayW, svgWidth - (x - 12) - baffleW)}
                height={svgHeight}
                fill="#0f172a"
                fillOpacity={0.8}
              />
            </g>
          );
        })}

        {/* Dimension: height arrow */}
        <line x1={4} y1={8} x2={4} y2={8 + svgHeight} stroke="#475569" strokeWidth={1} />
        <text x={2} y={8 + svgHeight / 2} fill="#64748b" fontSize={8} textAnchor="middle" transform={`rotate(-90,2,${8 + svgHeight / 2})`} fontFamily="JetBrains Mono, monospace">
          {metrics.ductHeight.toFixed(2)}m
        </text>

        {/* Dimension: width */}
        <line x1={12} y1={8 + svgHeight + 6} x2={12 + svgWidth} y2={8 + svgHeight + 6} stroke="#475569" strokeWidth={1} />
        <text x={12 + svgWidth / 2} y={8 + svgHeight + 18} fill="#64748b" fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          {ductWidth.toFixed(1)}m
        </text>
      </svg>

      {/* Metrics summary */}
      <div className="text-[9px] font-mono space-y-0.5 text-center text-slate-400">
        <div>
          <span className="text-slate-500">Profile: </span>
          <span className="text-slate-200">{profile.baffleThickness}mm / {profile.airwayWidth}mm</span>
        </div>
        <div>
          <span className="text-slate-500">Open Area: </span>
          <span className="text-slate-200">{profile.openArea}%</span>
        </div>
        <div>
          <span className="text-slate-500">Risk: </span>
          <span style={{ color: riskColor }} className="font-bold">{metrics.selfNoiseRisk}</span>
        </div>
      </div>
    </div>
  );
}

export function DuctCrossSection({
  intakeMetrics,
  dischargeMetrics,
  intakeDuctWidth,
  dischargeDuctWidth,
}: DuctCrossSectionProps) {
  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-3 text-center">
        Silencer Cross-Section Geometry (scaled)
      </p>
      <div className="flex justify-around items-end gap-4 px-4">
        <BaffleView
          metrics={intakeMetrics}
          ductWidth={intakeDuctWidth}
          color="#38bdf8"
          label="Intake"
        />
        <BaffleView
          metrics={dischargeMetrics}
          ductWidth={dischargeDuctWidth}
          color="#fb7185"
          label="Discharge"
        />
      </div>
    </div>
  );
}
