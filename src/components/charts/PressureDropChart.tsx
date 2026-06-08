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
import { UnitSystem } from '../../hooks/useUnitSystem';
import { convertToDisplay, getUnitLabel } from '../../utils/units';

interface PressureDropChartProps {
  intakeTargetLoss: number;
  dischargeTargetLoss: number;
  intakeDuctWidth: number;
  dischargeDuctWidth: number;
  designAirflow: number;
  airDensityEnclosure: number;
  currentIntakeHeight: number;
  currentDischargeHeight: number;
  unitSystem: UnitSystem;
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
  unitSystem,
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
      height: parseFloat(convertToDisplay(height, 'length', unitSystem).toFixed(1)),
      Intake: parseFloat(convertToDisplay(intakeDP, 'pressure', unitSystem).toFixed(1)),
      Discharge: parseFloat(convertToDisplay(dischargeDP, 'pressure', unitSystem).toFixed(1)),
    };
  });

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Pressure Drop ({getUnitLabel('pressure', unitSystem)}) vs Duct Height ({getUnitLabel('length', unitSystem)})
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="height"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            label={{ value: `Height (${getUnitLabel('length', unitSystem)})`, position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
            tickFormatter={(v) => `${v}${getUnitLabel('length', unitSystem)}`}
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
            labelFormatter={(v) => `Height: ${v}${getUnitLabel('length', unitSystem)}`}
            formatter={(value, name) => [`${Number(value).toFixed(1)} ${getUnitLabel('pressure', unitSystem)}`, String(name)]}
          />
          <ReferenceLine x={parseFloat(convertToDisplay(currentIntakeHeight, 'length', unitSystem).toFixed(1))} stroke="#38bdf8" strokeDasharray="4 2" opacity={0.6} />
          <ReferenceLine x={parseFloat(convertToDisplay(currentDischargeHeight, 'length', unitSystem).toFixed(1))} stroke="#fb7185" strokeDasharray="4 2" opacity={0.6} />
          <ReferenceLine y={convertToDisplay(60, 'pressure', unitSystem)} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `${convertToDisplay(60, 'pressure', unitSystem).toFixed(0)} warn`, fill: '#f59e0b', fontSize: 9 }} />
          <ReferenceLine y={convertToDisplay(100, 'pressure', unitSystem)} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `${convertToDisplay(100, 'pressure', unitSystem).toFixed(0)} crit`, fill: '#ef4444', fontSize: 9 }} />
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
