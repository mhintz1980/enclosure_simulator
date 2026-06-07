import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { DuctMetrics } from '../../types';

interface VelocityChartProps {
  intakeMetrics: DuctMetrics;
  dischargeMetrics: DuctMetrics;
}

const MODERATE_THRESHOLD = 10;
const CRITICAL_THRESHOLD = 15;

function velocityColor(value: number): string {
  if (value > CRITICAL_THRESHOLD) return '#fb7185'; // rose
  if (value > MODERATE_THRESHOLD) return '#fbbf24'; // amber
  return '#34d399'; // emerald
}

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}

const CustomLabel = ({ x = 0, y = 0, width = 0, value = 0 }: CustomLabelProps) => (
  <text
    x={x + width / 2}
    y={y - 4}
    fill={velocityColor(value)}
    textAnchor="middle"
    fontSize={10}
    fontFamily="JetBrains Mono, monospace"
    fontWeight="600"
  >
    {value.toFixed(1)}
  </text>
);

export function VelocityChart({ intakeMetrics, dischargeMetrics }: VelocityChartProps) {
  const data = [
    {
      label: 'Intake Face',
      value: parseFloat(intakeMetrics.faceVelocity.toFixed(2)),
      type: 'face',
      side: 'Intake',
    },
    {
      label: 'Intake Interstit.',
      value: parseFloat(intakeMetrics.interstitialVelocity.toFixed(2)),
      type: 'interstitial',
      side: 'Intake',
    },
    {
      label: 'Discharge Face',
      value: parseFloat(dischargeMetrics.faceVelocity.toFixed(2)),
      type: 'face',
      side: 'Discharge',
    },
    {
      label: 'Discharge Interstit.',
      value: parseFloat(dischargeMetrics.interstitialVelocity.toFixed(2)),
      type: 'interstitial',
      side: 'Discharge',
    },
  ];

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Face &amp; Interstitial Velocity (m/s) — Thresholds: 10 / 15 m/s
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            tickFormatter={(v) => `${v}`}
            width={30}
            domain={[0, 'auto']}
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
            formatter={(value) => [`${Number(value).toFixed(2)} m/s`, 'Velocity']}
          />
          <ReferenceLine
            y={MODERATE_THRESHOLD}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: '10 m/s', fill: '#f59e0b', fontSize: 9, position: 'right' }}
          />
          <ReferenceLine
            y={CRITICAL_THRESHOLD}
            stroke="#ef4444"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: '15 m/s', fill: '#ef4444', fontSize: 9, position: 'right' }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} label={<CustomLabel />}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={velocityColor(entry.value)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
