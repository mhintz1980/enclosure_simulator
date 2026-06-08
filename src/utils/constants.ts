import { SilencerProfile, EnginePreset } from '../types';
import { PumpPackagePreset } from '../types/ui';

// ── Silencer Profiles (unchanged — same acoustic physics) ───────────
// These model tortuous-path inlet/exhaust silencers.
// Baffles create a serpentine airflow path that attenuates sound energy
// through absorption and reflection, at the cost of pressure drop.

export const SILENCER_PROFILES: SilencerProfile[] = [
  {
    name: 'Type LD (Low Attenuation / Ultra-Low ΔP)',
    baffleThickness: 100,
    airwayWidth: 100,
    openArea: 50,
    lossCoefficientK: 1.4,
    octaveAttenuation: [3, 8, 15, 22, 25, 20, 14, 10],
    idealRange: [0, 20],
  },
  {
    name: 'Type MD (Medium Attenuation / Balanced ΔP)',
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

// ── Atmospheric / Thermodynamic Constants ───────────────────────────

export const T_AMBIENT = 32.5;          // °C — design ambient
export const CP_AIR = 1.005;            // kJ/(kg·K)
export const AIR_GAS_CONSTANT = 0.287;  // kJ/(kg·K) specific gas constant for air
export const STANDARD_PRESSURE = 101.325; // kPa

// ── Noise / Acoustic Constants ──────────────────────────────────────

/** ISO 3744 standard measurement distances (meters) */
export const DEFAULT_NOISE_DISTANCES = [1, 3, 7, 10, 15, 30];

/** Reference distance for SWL→SPL conversion */
export const REFERENCE_DISTANCE = 1; // meter

/** Directivity factors based on enclosure placement relative to reflecting surfaces */
export const DIRECTIVITY_FACTORS: Record<string, { Q: number; label: string; description: string }> = {
  'free-field':    { Q: 1, label: 'Free Field (Q=1)',       description: 'Suspended in open air — no reflecting surfaces' },
  'half-space':    { Q: 2, label: 'Half-Space (Q=2)',       description: 'On flat ground, away from walls — most common for portable equipment' },
  'quarter-space': { Q: 4, label: 'Quarter-Space (Q=4)',    description: 'On ground near one wall' },
  'eighth-space':  { Q: 8, label: 'Eighth-Space (Q=8)',     description: 'On ground in a corner (two walls)' },
};

/** OSHA and common noise regulatory thresholds */
export const NOISE_THRESHOLDS = {
  OSHA_8HR: 85,           // dB(A) — 8-hour permissible exposure
  OSHA_ACTION: 85,        // dB(A) — hearing conservation program trigger
  MUNICIPAL_TYPICAL: 70,  // dB(A) — common municipal noise ordinance
  RESIDENTIAL_NIGHT: 55,  // dB(A) — common residential nighttime limit
};

// ── Engine Database ─────────────────────────────────────────────────
// Heat rejection and airflow values are reference estimates.
// Always verify against the actual engine datasheet for your installation.

export const ENGINE_PRESETS: EnginePreset[] = [
  // ── Hatz ──
  {
    manufacturer: 'Hatz',
    model: '1D42Z',
    ratedPower: 3.4,
    heatRejection: 2.5,
    radiatorAirflow: 0.3,
    cooling: 'air',
    cylinders: 1,
    rpmRange: [1500, 3600],
  },
  {
    manufacturer: 'Hatz',
    model: '1B50E',
    ratedPower: 7.4,
    heatRejection: 4.5,
    radiatorAirflow: 0.5,
    cooling: 'air',
    cylinders: 1,
    rpmRange: [1500, 3600],
  },
  {
    manufacturer: 'Hatz',
    model: '1D90',
    ratedPower: 10.0,
    heatRejection: 6.0,
    radiatorAirflow: 0.6,
    cooling: 'air',
    cylinders: 1,
    rpmRange: [1500, 3600],
  },
  {
    manufacturer: 'Hatz',
    model: '1D90 EZ',
    ratedPower: 10.0,
    heatRejection: 6.0,
    radiatorAirflow: 0.6,
    cooling: 'air',
    cylinders: 1,
    rpmRange: [1500, 3600],
  },
  {
    manufacturer: 'Hatz',
    model: '3H50T',
    ratedPower: 37.0,
    heatRejection: 12.0,
    radiatorAirflow: 1.8,
    cooling: 'liquid',
    cylinders: 3,
    rpmRange: [1500, 2800],
  },
  {
    manufacturer: 'Hatz',
    model: '3H50TIC',
    ratedPower: 42.0,
    heatRejection: 14.0,
    radiatorAirflow: 2.0,
    cooling: 'liquid',
    cylinders: 3,
    rpmRange: [1500, 2800],
  },
  // ── Isuzu ──
  {
    manufacturer: 'Isuzu',
    model: '4LE2X',
    ratedPower: 35.0,
    heatRejection: 11.0,
    radiatorAirflow: 1.5,
    cooling: 'liquid',
    cylinders: 4,
    rpmRange: [1500, 2500],
  },
  {
    manufacturer: 'Isuzu',
    model: '4LE2XABW',
    ratedPower: 35.0,
    heatRejection: 11.0,
    radiatorAirflow: 1.5,
    cooling: 'liquid',
    cylinders: 4,
    rpmRange: [1500, 2500],
  },
  {
    manufacturer: 'Isuzu',
    model: '3CH1',
    ratedPower: 8.0,
    heatRejection: 5.0,
    radiatorAirflow: 0.5,
    cooling: 'liquid',
    cylinders: 3,
    rpmRange: [1500, 3000],
  },
  // ── Deutz ──
  {
    manufacturer: 'Deutz',
    model: 'F4L2011',
    ratedPower: 30.0,
    heatRejection: 18.0,
    radiatorAirflow: 1.2,
    cooling: 'air',
    cylinders: 4,
    rpmRange: [1500, 2800],
  },
  // ── Perkins ──
  {
    manufacturer: 'Perkins',
    model: '904J',
    ratedPower: 60.0,
    heatRejection: 7.0,
    radiatorAirflow: 2.0,
    cooling: 'liquid',
    cylinders: 4,
    rpmRange: [1500, 2800],
  },
];

// ── Default Pump Package Presets ────────────────────────────────────

export const DEFAULT_PUMP_PRESETS: PumpPackagePreset[] = [
  {
    name: 'Small Wellpoint — Hatz 1D90',
    engineManufacturer: 'Hatz',
    engineModel: '1D90',
    engineHeat: 6.0,
    radiatorAirflow: 0.6,
    targetEnclosureTemp: 45,
    pumpType: 'wellpoint',
    vacuumPumpType: 'none',
    vacuumPumpHeat: 0,
    sourceSWL: 95,
  },
  {
    name: 'Wellpoint + Vac Pump — Isuzu 4LE2X',
    engineManufacturer: 'Isuzu',
    engineModel: '4LE2X',
    engineHeat: 11.0,
    radiatorAirflow: 1.5,
    targetEnclosureTemp: 45,
    pumpType: 'wellpoint',
    vacuumPumpType: 'rotary-claw',
    vacuumPumpHeat: 3.0,
    sourceSWL: 100,
  },
  {
    name: 'Trash Pump — Deutz F4L2011',
    engineManufacturer: 'Deutz',
    engineModel: 'F4L2011',
    engineHeat: 18.0,
    radiatorAirflow: 1.2,
    targetEnclosureTemp: 50,
    pumpType: 'trash',
    vacuumPumpType: 'none',
    vacuumPumpHeat: 0,
    sourceSWL: 105,
  },
  {
    name: 'Large Wellpoint — Perkins 904J + Rotary Claw',
    engineManufacturer: 'Perkins',
    engineModel: '904J',
    engineHeat: 7.0,
    radiatorAirflow: 2.0,
    targetEnclosureTemp: 42,
    pumpType: 'wellpoint',
    vacuumPumpType: 'rotary-claw',
    vacuumPumpHeat: 4.0,
    sourceSWL: 105,
  },
  {
    name: 'Centrifugal — Hatz 3H50TIC',
    engineManufacturer: 'Hatz',
    engineModel: '3H50TIC',
    engineHeat: 14.0,
    radiatorAirflow: 2.0,
    targetEnclosureTemp: 45,
    pumpType: 'centrifugal',
    vacuumPumpType: 'none',
    vacuumPumpHeat: 0,
    sourceSWL: 100,
  },
];

// ── Typical Vacuum Pump Heat Rejection Reference ────────────────────

export const VACUUM_PUMP_HEAT_REFERENCE: Record<string, { typicalHeat: number; description: string }> = {
  'rotary-vane-dry':  { typicalHeat: 2.5, description: 'Dry rotary vane — heat radiated directly from pump body' },
  'rotary-vane-oil':  { typicalHeat: 4.0, description: 'Oil-cooled rotary vane — includes oil cooler heat rejection inside enclosure' },
  'rotary-claw':      { typicalHeat: 3.0, description: 'Rotary claw — moderate heat from compression' },
  'liquid-ring':      { typicalHeat: 1.5, description: 'Liquid ring — lower heat, seal water absorbs energy' },
  'none':             { typicalHeat: 0,   description: 'No vacuum pump' },
};