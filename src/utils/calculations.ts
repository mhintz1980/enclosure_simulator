import {
  DuctMetrics,
  SilencerProfile,
  CalculationResults,
  NoiseResults,
  NoiseAtDistancePoint,
  VibrationAssessment,
  DirectivityPlacement,
  MountType,
} from '../types';
import { CalculationInputs } from '../types/ui';
import {
  SILENCER_PROFILES,
  T_AMBIENT,
  CP_AIR,
  AIR_GAS_CONSTANT,
  STANDARD_PRESSURE,
  DIRECTIVITY_FACTORS,
} from './constants';

// Re-export types for backward compatibility
export type { CalculationInputs } from '../types/ui';

// ── Air Density ─────────────────────────────────────────────────────

export function calculateAirDensity(temperatureC: number): number {
  return STANDARD_PRESSURE / (AIR_GAS_CONSTANT * (temperatureC + 273.15));
}

// ── Silencer Profile Selection ──────────────────────────────────────

export function selectSilencerProfile(targetLoss: number): SilencerProfile {
  if (targetLoss <= 20) return SILENCER_PROFILES[0];
  if (targetLoss > 35) return SILENCER_PROFILES[2];
  return SILENCER_PROFILES[1];
}

// ── Duct / Silencer Metrics ─────────────────────────────────────────

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

// ── Noise at Distance (ISO 3744 based) ──────────────────────────────

/**
 * Calculates sound pressure level at a given distance from the source.
 *
 * SPL = SWL - 10·log₁₀(4π·r²/Q)
 *
 * Where:
 *   SWL = sound power level (dB)
 *   r   = distance from source (m)
 *   Q   = directivity factor (1=free field, 2=half-space, 4=quarter, 8=eighth)
 */
export function calculateSPLAtDistance(swl: number, distance: number, Q: number): number {
  if (distance <= 0) return swl;
  return swl - 10 * Math.log10((4 * Math.PI * distance * distance) / Q);
}

/**
 * Estimates the average attenuation across octave bands from a silencer profile.
 * Uses A-weighted emphasis (mid-frequencies weighted more heavily, matching human hearing).
 */
function estimateAverageAttenuation(profile: SilencerProfile): number {
  // A-weighting emphasis factors for octave bands 63Hz–8kHz
  // Higher weight on 500Hz–4kHz where human hearing is most sensitive
  const weights = [0.05, 0.08, 0.12, 0.18, 0.20, 0.18, 0.12, 0.07];
  let weightedSum = 0;
  for (let i = 0; i < profile.octaveAttenuation.length; i++) {
    weightedSum += profile.octaveAttenuation[i] * weights[i];
  }
  return weightedSum;
}

export function calculateNoiseResults(
  sourceSWL: number,
  distances: number[],
  directivityPlacement: DirectivityPlacement,
  intakeProfile: SilencerProfile,
  dischargeProfile: SilencerProfile
): NoiseResults {
  const Q = DIRECTIVITY_FACTORS[directivityPlacement]?.Q ?? 2;

  // Unattenuated noise at each distance
  const points: NoiseAtDistancePoint[] = distances.map((d) => ({
    distance: d,
    spl: parseFloat(calculateSPLAtDistance(sourceSWL, d, Q).toFixed(1)),
  }));

  // Estimate total silencer attenuation from both intake and discharge paths
  // In practice, the dominant path determines the net attenuation
  const intakeAttn = estimateAverageAttenuation(intakeProfile);
  const dischargeAttn = estimateAverageAttenuation(dischargeProfile);
  const effectiveAttenuation = Math.min(intakeAttn, dischargeAttn); // weakest path dominates

  const attenuatedSWL = sourceSWL - effectiveAttenuation;

  const attenuatedPoints: NoiseAtDistancePoint[] = distances.map((d) => ({
    distance: d,
    spl: parseFloat(calculateSPLAtDistance(attenuatedSWL, d, Q).toFixed(1)),
  }));

  return {
    sourceSWL,
    directivityQ: Q,
    points,
    attenuatedPoints,
  };
}

// ── Vibration Assessment ────────────────────────────────────────────

export function assessVibration(
  mountType: MountType,
  engineCylinders: number
): VibrationAssessment {
  const recommendations: string[] = [];
  let risk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  let message = '';

  if (mountType === 'trailer') {
    risk = 'MODERATE';
    message = 'Trailer-mounted units experience transport vibration and uneven ground. ';
    recommendations.push('Use spring isolators between engine/pump skid and trailer frame');
    recommendations.push('Ensure all enclosure panel fasteners are vibration-resistant (lock nuts, Nyloc)');
    recommendations.push('Check panel resonance — add damping material if panels buzz at engine RPM');

    if (engineCylinders <= 2) {
      risk = 'HIGH';
      message += 'Single/twin-cylinder engines produce high-amplitude vibration pulses. ';
      recommendations.push('Consider heavier flywheel or counterbalance for smoother operation');
      recommendations.push('Use flexible exhaust connections to prevent fatigue cracking');
    }
  } else if (mountType === 'skid') {
    risk = 'LOW';
    message = 'Skid-mounted units have a rigid base but still benefit from isolation. ';
    recommendations.push('Rubber anti-vibration mounts between engine and skid are recommended');

    if (engineCylinders <= 2) {
      risk = 'MODERATE';
      message += 'Single/twin-cylinder engines benefit from spring isolators over rubber mounts. ';
      recommendations.push('Consider spring isolators for improved vibration damping');
    }
  } else {
    // stationary
    message = 'Stationary installations allow the best vibration isolation options. ';
    recommendations.push('Concrete inertia base with spring isolators provides optimal damping');
    if (engineCylinders <= 2) {
      risk = 'MODERATE';
      message += 'Even stationary, single/twin-cylinder engines need good isolation. ';
    }
  }

  return { risk, message, recommendations };
}

// ── Main Calculation Entry Point ────────────────────────────────────

export function calculateResults(inputs: CalculationInputs): CalculationResults {
  const airDensityEnclosure = calculateAirDensity(inputs.targetEnclosureTemp);
  const deltaT = Math.max(0.5, inputs.targetEnclosureTemp - T_AMBIENT);

  // Total heat load = engine heat + vacuum pump heat + oil cooler heat
  const vacHeat = inputs.vacuumPumpConfig.type !== 'none' ? inputs.vacuumPumpConfig.heatRejection : 0;
  const oilCoolerHeat = inputs.vacuumPumpConfig.hasOilCooler ? inputs.vacuumPumpConfig.oilCoolerHeat : 0;
  const totalHeatLoad = inputs.engineHeat + vacHeat + oilCoolerHeat;

  // Thermal airflow requirement: Q = P / (ρ · Cp · ΔT)
  const qThermalRequired = totalHeatLoad / (airDensityEnclosure * CP_AIR * deltaT);

  // Design airflow is the larger of thermal requirement and radiator fan capacity
  const isAirflowDeficient = inputs.radiatorAirflow < qThermalRequired;
  const designAirflow = isAirflowDeficient ? qThermalRequired : inputs.radiatorAirflow;

  // Calculate intake and discharge silencer metrics
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

  // Noise at distance calculations
  const noiseResults = calculateNoiseResults(
    inputs.sourceSWL,
    inputs.noiseMeasurementDistances,
    inputs.directivityPlacement,
    intakeMetrics.selectedProfile,
    dischargeMetrics.selectedProfile
  );

  // Vibration assessment
  // Estimate cylinder count from engine heat (rough heuristic, overridden by presets)
  const vibrationAssessment = assessVibration(inputs.mountType, 4);

  // System status evaluation
  let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
  let statusMsg = 'System is within design limits — adequate cooling airflow and acceptable silencer pressure drop.';

  if (totalSystemPressureDrop > 100) {
    status = 'CRITICAL';
    statusMsg = 'High static restriction risks radiator fan stalling and engine overheating. Increase duct openings or reduce silencer attenuation.';
  } else if (
    totalSystemPressureDrop > 60 ||
    isAirflowDeficient ||
    intakeMetrics.selfNoiseRisk === 'CRITICAL' ||
    dischargeMetrics.selfNoiseRisk === 'CRITICAL'
  ) {
    status = 'WARNING';
    if (isAirflowDeficient) {
      statusMsg = 'Radiator fan airflow is insufficient to reject the total heat load at this enclosure temperature. Design flow has been auto-adjusted — verify radiator fan can deliver this airflow against the system pressure drop.';
    } else if (intakeMetrics.selfNoiseRisk === 'CRITICAL' || dischargeMetrics.selfNoiseRisk === 'CRITICAL') {
      statusMsg = 'Baffle interstitial velocity is too high — air rushing through narrow airways generates self-noise that undermines the silencer\'s attenuation. Increase duct area or use a lower-attenuation profile.';
    } else {
      statusMsg = 'Total system pressure drop is elevated. Verify the radiator fan performance curve can deliver required airflow against this backpressure.';
    }
  }

  return {
    T_AMBIENT,
    airDensityEnclosure,
    deltaT,
    totalHeatLoad,
    qThermalRequired,
    designAirflow,
    isAirflowDeficient,
    intakeMetrics,
    dischargeMetrics,
    totalSystemPressureDrop,
    noiseResults,
    vibrationAssessment,
    status,
    statusMsg,
  };
}