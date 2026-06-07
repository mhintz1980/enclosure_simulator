import { SilencerProfile } from '../types';

export const SILENCER_PROFILES: SilencerProfile[] = [
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
  },
];

export const T_AMBIENT = 32.5;
export const CP_AIR = 1.005;
export const AIR_GAS_CONSTANT = 0.287;
export const STANDARD_PRESSURE = 101.325;