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
  heatLoad: number;
  combustionAirflow: number;
  targetEnclosureTemp: number;
  intakeConfig: DuctConfig;
  dischargeConfig: DuctConfig;
  optimizationFocus: 'solve-height' | 'solve-pressure';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type OptimizationFocus = 'solve-height' | 'solve-pressure';
export type Status = 'OPTIMAL' | 'WARNING' | 'CRITICAL';
export type SelfNoiseRisk = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface Preset {
  name: string;
  heatLoad: number;
  combustionAirflow: number;
  targetEnclosureTemp: number;
}