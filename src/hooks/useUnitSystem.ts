import { useState, useEffect, useCallback } from 'react';

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

const STORAGE_KEY = 'unit-system';

export function useUnitSystem(): [UnitSystem, () => void] {
  const [system, setSystem] = useState<UnitSystem>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as UnitSystem | null;
      if (stored) return stored;
    }
    return 'SI';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, system);
  }, [system]);

  const toggle = useCallback(() => {
    setSystem(prev => prev === 'SI' ? 'Imperial' : 'SI');
  }, []);

  return [system, toggle];
}