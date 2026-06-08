import { useMemo } from 'react';
import { CalculationInputs } from '../types/ui';
import { CalculationResults } from '../types';
import { calculateResults } from '../utils/calculations';

export function useCalculations(inputs: CalculationInputs): CalculationResults {
  return useMemo(() => calculateResults(inputs), [
    inputs.engineHeat,
    inputs.radiatorAirflow,
    inputs.targetEnclosureTemp,
    inputs.vacuumPumpConfig.type,
    inputs.vacuumPumpConfig.heatRejection,
    inputs.vacuumPumpConfig.hasOilCooler,
    inputs.vacuumPumpConfig.oilCoolerHeat,
    inputs.intakeConfig.targetLoss,
    inputs.intakeConfig.ductWidth,
    inputs.intakeConfig.maxDP,
    inputs.dischargeConfig.targetLoss,
    inputs.dischargeConfig.ductWidth,
    inputs.dischargeConfig.maxDP,
    inputs.optimizationFocus,
    inputs.mountType,
    inputs.sourceSWL,
    inputs.directivityPlacement,
    inputs.noiseMeasurementDistances,
  ]);
}