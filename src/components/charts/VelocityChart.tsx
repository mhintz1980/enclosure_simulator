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
import { UnitSystem } from '../../hooks/useUnitSystem';
import { convertToDisplay, getUnitLabel } from '../../utils/units';

interface VelocityChartProps {
  intakeMetrics: DuctMetrics;
  dischargeMetrics: DuctMetrics;
  unitSystem: UnitSystem;
}

const MODERATE_THRESHOLD = 10;
const CRITICAL_THRESHOLD = 15;

function velocityColor(value: number, unitSystem: UnitSystem): string {
  const crit = convertToDisplay(CRITICAL_THRESHOLD, 'velocity', unitSystem);
  const mod = convertToDisplay(MODERATE_THRESHOLD, 'velocity', unitSystem);
  if (value > crit) return '#fb7185'; // rose
  if (value > mod) return '#fbbf24'; // amber
  return '#34d399'; // emerald
}

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  unitSystem?: UnitSystem;
}

const CustomLabel = ({ x = 0, y = 0, width = 0, value = 0, unitSystem = 'SI' }: CustomLabelProps) => (
  <text
    x={x + width / 2}
    y={y - 4}
    fill={velocityColor(value, unitSystem)}
    textAnchor="middle"
    fontSize={10}
    fontFamily="JetBrains Mono, monospace"
    fontWeight="600"
  >
    {value.toFixed(1)}
  </text>
);

export function VelocityChart({ intakeMetrics, dischargeMetrics, unitSystem }: VelocityChartProps) {
  const data = [
    {
      label: 'Intake Face',
      value: parseFloat(convertToDisplay(intakeMetrics.faceVelocity, 'velocity', unitSystem).toFixed(2)),
      type: 'face',
      side: 'Intake',
    },
    {
      label: 'Intake Interstit.',
      value: parseFloat(convertToDisplay(intakeMetrics.interstitialVelocity, 'velocity', unitSystem).toFixed(2)),
      type: 'interstitial',
      side: 'Intake',
    },
    {
      label: 'Discharge Face',
      value: parseFloat(convertToDisplay(dischargeMetrics.faceVelocity, 'velocity', unitSystem).toFixed(2)),
      type: 'face',
      side: 'Discharge',
    },
    {
      label: 'Discharge Interstit.',
      value: parseFloat(convertToDisplay(dischargeMetrics.interstitialVelocity, 'velocity', unitSystem).toFixed(2)),
      type: 'interstitial',
      side: 'Discharge',
    },
  ];

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Face &amp; Interstitial Velocity ({getUnitLabel('velocity', unitSystem)}) — Thresholds: {convertToDisplay(MODERATE_THRESHOLD, 'velocity', unitSystem).toFixed(0)} / {convertToDisplay(CRITICAL_THRESHOLD, 'velocity', unitSystem).toFixed(0)} {getUnitLabel('velocity', unitSystem)}
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
            formatter={(value) => [`${Number(value).toFixed(2)} ${getUnitLabel('velocity', unitSystem)}`, 'Velocity']}
          />
          <ReferenceLine
            y={convertToDisplay(MODERATE_THRESHOLD, 'velocity', unitSystem)}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: `${convertToDisplay(MODERATE_THRESHOLD, 'velocity', unitSystem).toFixed(0)} ${getUnitLabel('velocity', unitSystem)}`, fill: '#f59e0b', fontSize: 9, position: 'right' }}
          />
          <ReferenceLine
            y={convertToDisplay(CRITICAL_THRESHOLD, 'velocity', unitSystem)}
            stroke="#ef4444"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: `${convertToDisplay(CRITICAL_THRESHOLD, 'velocity', unitSystem).toFixed(0)} ${getUnitLabel('velocity', unitSystem)}`, fill: '#ef4444', fontSize: 9, position: 'right' }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} label={<CustomLabel unitSystem={unitSystem} />}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={velocityColor(entry.value, unitSystem)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
