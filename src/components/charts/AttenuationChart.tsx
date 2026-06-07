import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { SilencerProfile } from '../../types';

interface AttenuationChartProps {
  intakeProfile: SilencerProfile;
  dischargeProfile: SilencerProfile;
}

const OCTAVE_BANDS = ['63 Hz', '125 Hz', '250 Hz', '500 Hz', '1k Hz', '2k Hz', '4k Hz', '8k Hz'];

export function AttenuationChart({ intakeProfile, dischargeProfile }: AttenuationChartProps) {
  const data = OCTAVE_BANDS.map((band, i) => ({
    band,
    Intake: intakeProfile.octaveAttenuation[i] ?? 0,
    Discharge: dischargeProfile.octaveAttenuation[i] ?? 0,
  }));

  return (
    <div className="w-full">
      <p className="text-[10px] text-slate-500 font-mono mb-2 text-center">
        Insertion Loss by Octave Band (dB)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="band"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
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
            formatter={(value, name) => [`${Number(value).toFixed(1)} dB`, String(name)]}
          />
          <Radar
            name="Intake"
            dataKey="Intake"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: '#38bdf8' }}
          />
          <Radar
            name="Discharge"
            dataKey="Discharge"
            stroke="#fb7185"
            fill="#fb7185"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: '#fb7185' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
