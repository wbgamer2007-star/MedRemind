// Powered by OnSpace.AI
import { useMemo } from 'react';
import { useApp } from './useApp';
import { buildDaySchedule, ScheduledDose } from '../services/medicineService';

export function useSchedule(date: Date) {
  const { medicines, doseLogs } = useApp();
  return useMemo<ScheduledDose[]>(
    () => buildDaySchedule(medicines, doseLogs, date),
    [medicines, doseLogs, date]
  );
}

export function useTodaySchedule() {
  return useSchedule(new Date());
}
