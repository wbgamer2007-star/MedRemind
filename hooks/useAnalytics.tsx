// Powered by OnSpace.AI
import { useMemo } from 'react';
import { useApp } from './useApp';
import { computeAnalytics, AdherenceData } from '../services/analyticsService';

export function useAnalytics(days: number = 30): AdherenceData {
  const { medicines, doseLogs } = useApp();
  return useMemo(
    () => computeAnalytics(medicines, doseLogs, days),
    [medicines, doseLogs, days]
  );
}
