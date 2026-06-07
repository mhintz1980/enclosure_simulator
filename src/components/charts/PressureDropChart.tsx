import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { selectSilencerProfile } from '../../utils/calculations';

interface PressureDropChartProps {
  intakeTargetLoss: number;
  dischargeTargetLoss: number;
  intakeDuctWidth: number;
  dischargeDuctWidth: number;
  designAirflow: number;
  airDensityEnclosure: number;
  currentIntakeHeight: number;
  currentDischargeHeight: number;
}

export function PressureDropChart({
  intakeTargetLoss,
  dischargeTargetLoss,
  intakeDuctWidth,
  dischargeDuctWidth,
  designAirflow,
  airDensityEnclosure,
  currentIntakeHeight,
  currentDischargeHeight,
}: PressureDropChartProps) {
  const intakeProfile = selectSilencerProfile(intakeTargetLoss);
  const dischargeProfile = selectSilencerProfile(dischargeTargetLoss);

  // Generate sweep data for duct heights 0.3m → 3.0m in 0.1 steps
  const data = Array.from({ length: 28 }, (_, i) => {
    const height = parseFloat((0.3 + i * 0.1).toFixed(1));

    const intakeArea = intakeDuctWidth * height;
    const intakeFaceVel = designAirflow / intakeArea;
    const intakeDP = intakeProfile.lossCoefficientK * 0.5 * airDensityEnclosure * Math.pow(intakeFaceVel, 2);

    const dischargeArea = dischargeDuctWidth * height;
    const dischargeFaceVel = designAirflow / dischargeArea;
    const dischargeDP = dischargeProfile.lossCoefficientK * 0.5 * airDensityEnclosure * Math.pow(dischargeFaceVel, 2);

    return {
      height,
      Intake: parseFloat(intakeDP.toFixed(1)),
      Discharge: parseFloat(dischargeDP.toFixed(1)),
    };
  });

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Pressure Drop vs Duct Height (Pa)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="height"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            label={{ value: 'Height (m)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
            tickFormatter={(v) => `${v}m`}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            tickFormatter={(v) => `${v}`}
            width={35}
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
            labelFormatter={(v) => `Height: ${v}m`}
            formatter={(value, name) => [`${Number(value).toFixed(1)} Pa`, String(name)]}
          />
          <ReferenceLine x={currentIntakeHeight} stroke="#38bdf8" strokeDasharray="4 2" opacity={0.6} />
          <ReferenceLine x={currentDischargeHeight} stroke="#fb7185" strokeDasharray="4 2" opacity={0.6} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '60 Pa warn', fill: '#f59e0b', fontSize: 9 }} />
          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '100 Pa crit', fill: '#ef4444', fontSize: 9 }} />
          <Line
            type="monotone"
            dataKey="Intake"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#38bdf8' }}
          />
          <Line
            type="monotone"
            dataKey="Discharge"
            stroke="#fb7185"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#fb7185' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
