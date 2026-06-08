export type UnitSystem = 'SI' | 'Imperial';

export interface UnitConfig {
  system: UnitSystem;
  units: {
    heatLoad: { SI: 'kW'; Imperial: 'BTU/hr' };
    airflow: { SI: 'm³/s'; Imperial: 'CFM' };
    temperature: { SI: '°C'; Imperial: '°F' };
    pressure: { SI: 'Pa'; Imperial: 'inH₂O' };
    velocity: { SI: 'm/s'; Imperial: 'ft/min' };
    length: { SI: 'm'; Imperial: 'ft' };
    area: { SI: 'm²'; Imperial: 'ft²' };
  };
}

export interface DuctConfig {
  targetLoss: number;
  ductWidth: number;
  maxDP: number;
}

export interface CalculationInputs {
  /** Engine radiated heat rejection inside enclosure (kW) */
  engineHeat: number;
  /** Engine radiator fan airflow capacity (m³/s) */
  radiatorAirflow: number;
  /** Maximum allowed temperature inside enclosure (°C) */
  targetEnclosureTemp: number;
  /** Vacuum pump configuration (type, heat, oil cooler) */
  vacuumPumpConfig: import('./index').VacuumPumpConfig;
  /** Intake silencer duct configuration */
  intakeConfig: DuctConfig;
  /** Discharge silencer duct configuration */
  dischargeConfig: DuctConfig;
  /** Optimization strategy */
  optimizationFocus: 'solve-height' | 'solve-pressure';
  /** Mount type for vibration assessment */
  mountType: import('./index').MountType;
  /** Enclosure outer dimensions */
  enclosureDimensions: import('./index').EnclosureDimensions;
  /** Noise measurement distances in meters */
  noiseMeasurementDistances: number[];
  /** Directivity placement for noise calculations */
  directivityPlacement: import('./index').DirectivityPlacement;
  /** Estimated source sound power level (dB) — from engine specs or estimate */
  sourceSWL: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type OptimizationFocus = 'solve-height' | 'solve-pressure';
export type Status = 'OPTIMAL' | 'WARNING' | 'CRITICAL';
export type SelfNoiseRisk = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface PumpPackagePreset {
  name: string;
  engineManufacturer: string;
  engineModel: string;
  engineHeat: number;
  radiatorAirflow: number;
  targetEnclosureTemp: number;
  pumpType: import('./index').PumpType;
  vacuumPumpType: import('./index').VacuumPumpType;
  vacuumPumpHeat: number;
  sourceSWL: number;
}