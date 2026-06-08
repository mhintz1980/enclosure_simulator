export const CONVERSIONS = {
  kW_to_BTUhr: 3412.14,
  BTUhr_to_kW: 1 / 3412.14,
  m3s_to_CFM: 2118.88,
  CFM_to_m3s: 1 / 2118.88,
  C_to_F: (c: number) => c * 9/5 + 32,
  F_to_C: (f: number) => (f - 32) * 5/9,
  Pa_to_inH2O: 0.00401463,
  inH2O_to_Pa: 1 / 0.00401463,
  mps_to_fpm: 196.85,
  fpm_to_mps: 1 / 196.85,
  m_to_ft: 3.28084,
  ft_to_m: 1 / 3.28084,
  m2_to_ft2: 10.7639,
  ft2_to_m2: 1 / 10.7639,
};

export function convertToDisplay(value: number, type: 'heatLoad' | 'airflow' | 'temperature' | 'pressure' | 'velocity' | 'length' | 'area', system: 'SI' | 'Imperial'): number {
  if (system === 'SI') return value;

  switch (type) {
    case 'heatLoad': return value * CONVERSIONS.kW_to_BTUhr;
    case 'airflow': return value * CONVERSIONS.m3s_to_CFM;
    case 'temperature': return CONVERSIONS.C_to_F(value);
    case 'pressure': return value * CONVERSIONS.Pa_to_inH2O;
    case 'velocity': return value * CONVERSIONS.mps_to_fpm;
    case 'length': return value * CONVERSIONS.m_to_ft;
    case 'area': return value * CONVERSIONS.m2_to_ft2;
    default: return value;
  }
}

export function convertFromDisplay(value: number, type: 'heatLoad' | 'airflow' | 'temperature' | 'pressure' | 'velocity' | 'length' | 'area', system: 'SI' | 'Imperial'): number {
  if (system === 'SI') return value;

  switch (type) {
    case 'heatLoad': return value * CONVERSIONS.BTUhr_to_kW;
    case 'airflow': return value * CONVERSIONS.CFM_to_m3s;
    case 'temperature': return CONVERSIONS.F_to_C(value);
    case 'pressure': return value * CONVERSIONS.inH2O_to_Pa;
    case 'velocity': return value * CONVERSIONS.fpm_to_mps;
    case 'length': return value * CONVERSIONS.ft_to_m;
    case 'area': return value * CONVERSIONS.ft2_to_m2;
    default: return value;
  }
}

export function getUnitLabel(type: 'heatLoad' | 'airflow' | 'temperature' | 'pressure' | 'velocity' | 'length' | 'area', system: 'SI' | 'Imperial'): string {
  if (system === 'SI') {
    switch (type) {
      case 'heatLoad': return 'kW';
      case 'airflow': return 'm³/s';
      case 'temperature': return '°C';
      case 'pressure': return 'Pa';
      case 'velocity': return 'm/s';
      case 'length': return 'm';
      case 'area': return 'm²';
      default: return '';
    }
  } else {
    switch (type) {
      case 'heatLoad': return 'BTU/hr';
      case 'airflow': return 'CFM';
      case 'temperature': return '°F';
      case 'pressure': return 'inH₂O';
      case 'velocity': return 'ft/min';
      case 'length': return 'ft';
      case 'area': return 'ft²';
      default: return '';
    }
  }
}
