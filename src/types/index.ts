// ── Pump & Equipment Types ──────────────────────────────────────────

export type PumpType =
  | 'centrifugal'
  | 'positive-displacement'
  | 'diaphragm'
  | 'trash'
  | 'wellpoint'
  | 'other';

export type VacuumPumpType =
  | 'rotary-vane-dry'
  | 'rotary-vane-oil'
  | 'rotary-claw'
  | 'liquid-ring'
  | 'none';

export type MountType = 'skid' | 'trailer' | 'stationary';

export type VibrationIsolation = 'rubber-mount' | 'spring-isolator' | 'none';

// ── Vacuum Pump Configuration ───────────────────────────────────────

export interface VacuumPumpConfig {
  type: VacuumPumpType;
  /** Heat rejected inside the enclosure (kW) */
  heatRejection: number;
  /** Whether the vacuum pump has an oil cooler inside the enclosure */
  hasOilCooler: boolean;
  /** Additional heat from oil cooler radiating inside enclosure (kW) */
  oilCoolerHeat: number;
}

// ── Enclosure Geometry ──────────────────────────────────────────────

export interface EnclosureDimensions {
  /** Overall length in meters (inlet-to-exhaust axis) */
  length: number;
  /** Overall width in meters */
  width: number;
  /** Overall height in meters */
  height: number;
}

// ── Silencer / Baffle Profiles (unchanged — same acoustic physics) ──

export interface SilencerProfile {
  name: string;
  /** Baffle thickness in mm */
  baffleThickness: number;
  /** Airway width between baffles in mm */
  airwayWidth: number;
  /** Open area percentage */
  openArea: number;
  /** Loss coefficient K for pressure drop calculation */
  lossCoefficientK: number;
  /** Attenuation per octave band (dB) — 63Hz through 8kHz */
  octaveAttenuation: number[];
  /** Ideal target-loss range this profile is suited for [min, max] dB */
  idealRange: [number, number];
}

// ── Duct / Silencer Metrics ─────────────────────────────────────────

export interface DuctMetrics {
  selectedProfile: SilencerProfile;
  ductHeight: number;
  calculatedArea: number;
  faceVelocity: number;
  interstitialVelocity: number;
  computedPressureDrop: number;
  selfNoiseRisk: 'LOW' | 'MODERATE' | 'CRITICAL';
}

// ── Noise at Distance ───────────────────────────────────────────────

export type DirectivityPlacement = 'free-field' | 'half-space' | 'quarter-space' | 'eighth-space';

export interface NoiseAtDistancePoint {
  distance: number;
  spl: number;
}

export interface NoiseResults {
  /** Estimated source sound power level (dB) */
  sourceSWL: number;
  /** Directivity factor Q */
  directivityQ: number;
  /** SPL at each measurement distance */
  points: NoiseAtDistancePoint[];
  /** Attenuated (with silencers) SPL at each distance */
  attenuatedPoints: NoiseAtDistancePoint[];
}

// ── Vibration Assessment ────────────────────────────────────────────

export interface VibrationAssessment {
  risk: 'LOW' | 'MODERATE' | 'HIGH';
  message: string;
  recommendations: string[];
}

// ── Engine Preset ───────────────────────────────────────────────────

export interface EnginePreset {
  manufacturer: string;
  model: string;
  ratedPower: number;       // kW
  heatRejection: number;    // kW — radiated heat to atmosphere inside enclosure
  radiatorAirflow: number;  // m³/s — radiator fan capacity
  cooling: 'liquid' | 'air';
  cylinders: number;
  rpmRange: [number, number];
}

// ── Main Calculation Results ────────────────────────────────────────

export interface CalculationResults {
  T_AMBIENT: number;
  airDensityEnclosure: number;
  deltaT: number;
  /** Total heat that must be rejected (engine + vacuum pump + oil cooler) */
  totalHeatLoad: number;
  /** Airflow required for thermal balance */
  qThermalRequired: number;
  /** Design airflow used for sizing (max of thermal required vs radiator fan) */
  designAirflow: number;
  isAirflowDeficient: boolean;
  intakeMetrics: DuctMetrics;
  dischargeMetrics: DuctMetrics;
  totalSystemPressureDrop: number;
  noiseResults: NoiseResults;
  vibrationAssessment: VibrationAssessment;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  statusMsg: string;
}

export * from './ui';