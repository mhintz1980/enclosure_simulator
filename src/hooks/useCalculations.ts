import { useMemo } from 'react';
import { CalculationInputs } from '../utils/calculations';
import { CalculationResults } from '../types';
import { calculateResults } from '../utils/calculations';

export function useCalculations(inputs: CalculationInputs): CalculationResults {
  return useMemo(() => calculateResults(inputs), [
    inputs.heatLoad,
    inputs.combustionAirflow,
    inputs.targetEnclosureTemp,
    inputs.intakeConfig.targetLoss,
    inputs.intakeConfig.ductWidth,
    inputs.intakeConfig.maxDP,
    inputs.dischargeConfig.targetLoss,
    inputs.dischargeConfig.ductWidth,
    inputs.dischargeConfig.maxDP,
    inputs.optimizationFocus,
  ]);
}