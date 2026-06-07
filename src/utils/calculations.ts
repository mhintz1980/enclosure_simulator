import { DuctMetrics, SilencerProfile, CalculationResults } from '../types';
import { SILENCER_PROFILES, T_AMBIENT, CP_AIR, AIR_GAS_CONSTANT, STANDARD_PRESSURE } from './constants';

export interface DuctConfig {
  targetLoss: number;
  ductWidth: number;
  maxDP: number;
}

export interface CalculationInputs {
  heatLoad: number;
  combustionAirflow: number;
  targetEnclosureTemp: number;
  intakeConfig: DuctConfig;
  dischargeConfig: DuctConfig;
  optimizationFocus: 'solve-height' | 'solve-pressure';
}

export function calculateAirDensity(temperatureC: number): number {
  return STANDARD_PRESSURE / (AIR_GAS_CONSTANT * (temperatureC + 273.15));
}

export function selectSilencerProfile(targetLoss: number): SilencerProfile {
  if (targetLoss <= 20) return SILENCER_PROFILES[0];
  if (targetLoss > 35) return SILENCER_PROFILES[2];
  return SILENCER_PROFILES[1];
}

export function calculateDuctMetrics(
  targetLoss: number,
  ductWidth: number,
  maxDP: number,
  designAirflow: number,
  airDensityEnclosure: number,
  optimizationFocus: 'solve-height' | 'solve-pressure'
): DuctMetrics {
  const selectedProfile = selectSilencerProfile(targetLoss);
  let ductHeight = 1.5;

  if (optimizationFocus === 'solve-height') {
    const maxAllowedVelocity = Math.sqrt((2 * maxDP) / (selectedProfile.lossCoefficientK * airDensityEnclosure));
    const reqDuctArea = designAirflow / maxAllowedVelocity;
    ductHeight = Math.max(0.3, reqDuctArea / ductWidth);
  } else {
    ductHeight = 1.6;
  }

  const calculatedArea = ductWidth * ductHeight;
  const faceVelocity = designAirflow / calculatedArea;
  const computedPressureDrop = selectedProfile.lossCoefficientK * 0.5 * airDensityEnclosure * Math.pow(faceVelocity, 2);
  const interstitialVelocity = faceVelocity / (selectedProfile.openArea / 100);
  const selfNoiseRisk = interstitialVelocity > 15 ? 'CRITICAL' : interstitialVelocity > 10 ? 'MODERATE' : 'LOW';

  return {
    selectedProfile,
    ductHeight,
    calculatedArea,
    faceVelocity,
    interstitialVelocity,
    computedPressureDrop,
    selfNoiseRisk,
  };
}

export function calculateResults(inputs: CalculationInputs): CalculationResults {
  const airDensityEnclosure = calculateAirDensity(inputs.targetEnclosureTemp);
  const deltaT = Math.max(0.5, inputs.targetEnclosureTemp - T_AMBIENT);
  const qThermalRequired = inputs.heatLoad / (airDensityEnclosure * CP_AIR * deltaT);

  const isAirflowDeficient = inputs.combustionAirflow < qThermalRequired;
  const designAirflow = isAirflowDeficient ? qThermalRequired : inputs.combustionAirflow;

  const intakeMetrics = calculateDuctMetrics(
    inputs.intakeConfig.targetLoss,
    inputs.intakeConfig.ductWidth,
    inputs.intakeConfig.maxDP,
    designAirflow,
    airDensityEnclosure,
    inputs.optimizationFocus
  );

  const dischargeMetrics = calculateDuctMetrics(
    inputs.dischargeConfig.targetLoss,
    inputs.dischargeConfig.ductWidth,
    inputs.dischargeConfig.maxDP,
    designAirflow,
    airDensityEnclosure,
    inputs.optimizationFocus
  );

  const totalSystemPressureDrop = intakeMetrics.computedPressureDrop + dischargeMetrics.computedPressureDrop;

  let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
  let statusMsg = 'System matches Caterpillar and Price Industries standards.';

  if (totalSystemPressureDrop > 100) {
    status = 'CRITICAL';
    statusMsg = 'High static restriction risks radiator fan stalling and generator thermal shutdown.';
  } else if (
    totalSystemPressureDrop > 60 ||
    isAirflowDeficient ||
    intakeMetrics.selfNoiseRisk === 'CRITICAL' ||
    dischargeMetrics.selfNoiseRisk === 'CRITICAL'
  ) {
    status = 'WARNING';
    if (isAirflowDeficient) {
      statusMsg = 'Engine radiator fan airflow is insufficient to reject generator heat load at this temperature. Design flow auto-adjusted.';
    } else if (intakeMetrics.selfNoiseRisk === 'CRITICAL' || dischargeMetrics.selfNoiseRisk === 'CRITICAL') {
      statusMsg = 'Baffle interstitial velocity is too high, generating self-noise that bypasses acoustic attenuation.';
    } else {
      statusMsg = 'Total system static pressure drop is high. Verify radiator fan performance curve.';
    }
  }

  return {
    T_AMBIENT,
    airDensityEnclosure,
    deltaT,
    qThermalRequired,
    designAirflow,
    isAirflowDeficient,
    intakeMetrics,
    dischargeMetrics,
    totalSystemPressureDrop,
    status,
    statusMsg,
  };
}