import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { NoiseResults } from '../../types';
import { NOISE_THRESHOLDS } from '../../utils/constants';
import { UnitSystem } from '../../hooks/useUnitSystem';
import { convertToDisplay, getUnitLabel } from '../../utils/units';

interface NoiseDistanceChartProps {
  noiseResults: NoiseResults;
  unitSystem: UnitSystem;
}

export function NoiseDistanceChart({ noiseResults, unitSystem }: NoiseDistanceChartProps) {
  // Merge attenuated and unattenuated data by distance
  const data = noiseResults.points.map((p, i) => ({
    distance: `${convertToDisplay(p.distance, 'length', unitSystem).toFixed(0)}${getUnitLabel('length', unitSystem)}`,
    distanceNum: convertToDisplay(p.distance, 'length', unitSystem),
    Unattenuated: p.spl,
    Attenuated: noiseResults.attenuatedPoints[i]?.spl ?? p.spl,
  }));

  const barColor = (val: number) => {
    if (val >= NOISE_THRESHOLDS.OSHA_8HR) return '#fb7185';
    if (val >= NOISE_THRESHOLDS.MUNICIPAL_TYPICAL) return '#fbbf24';
    return '#34d399';
  };

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-1 text-center">
        Predicted Sound Pressure Level at Distance (dB(A)) — Q={noiseResults.directivityQ}
      </p>
      <p className="text-[9px] text-slate-600 font-mono mb-2 text-center">
        Source SWL: {noiseResults.sourceSWL} dB · Bars = with silencers · Line = without silencers
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="distance"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            label={{ value: 'Distance', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            domain={[40, 'auto']}
            width={35}
            label={{ value: 'dB(A)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#e2e8f0',
            }}
            formatter={(value, name) => [`${Number(value).toFixed(1)} dB(A)`, String(name)]}
          />

          {/* Regulatory threshold reference lines */}
          <ReferenceLine
            y={NOISE_THRESHOLDS.OSHA_8HR}
            stroke="#ef4444"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: `${NOISE_THRESHOLDS.OSHA_8HR} dB(A) OSHA 8-hr`, fill: '#ef4444', fontSize: 8, position: 'right' }}
          />
          <ReferenceLine
            y={NOISE_THRESHOLDS.MUNICIPAL_TYPICAL}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: `${NOISE_THRESHOLDS.MUNICIPAL_TYPICAL} dB(A) Municipal`, fill: '#f59e0b', fontSize: 8, position: 'right' }}
          />

          {/* Attenuated (with silencers) as bars */}
          <Bar dataKey="Attenuated" name="With Silencers" radius={[3, 3, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor(entry.Attenuated)} fillOpacity={0.75} />
            ))}
          </Bar>

          {/* Unattenuated as line overlay */}
          <Line
            type="monotone"
            dataKey="Unattenuated"
            name="Without Silencers"
            stroke="#fb7185"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#fb7185' }}
            activeDot={{ r: 5, fill: '#fb7185' }}
          />

          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
