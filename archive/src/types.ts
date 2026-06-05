export interface SilencerProfile {
  name: string;
  baffleThickness: number;
  airwayWidth: number;
  openArea: number;
  lossCoefficientK: number;
  octaveAttenuation: number[];
  idealRange: [number, number];
}

export interface CalculationResults {
  T_AMBIENT: number;
  airDensityEnclosure: number;
  deltaT: number;
  qThermalRequired: number;
  designAirflow: number;
  isAirflowDeficient: boolean;
  selectedProfile: SilencerProfile;
  ductHeight: number;
  calculatedArea: number;
  faceVelocity: number;
  interstitialVelocity: number;
  computedPressureDrop: number;
  selfNoiseRisk: 'LOW' | 'MODERATE' | 'CRITICAL';
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  statusMsg: string;
}