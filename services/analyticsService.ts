// Powered by OnSpace.AI
import { DoseLog, Medicine, getMedicinesForDate, buildDaySchedule } from './medicineService';

export interface AdherenceData {
  overall: number;
  last7Days: number;
  last30Days: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  streak: number;
  longestStreak: number;
  dailyAdherence: Array<{ date: string; rate: number; taken: number; total: number }>;
}

export function computeAnalytics(
  medicines: Medicine[],
  logs: DoseLog[],
  days: number = 30
): AdherenceData {
  const today = new Date();
  const dailyData: Array<{ date: string; rate: number; taken: number; total: number }> = [];

  let totalDoses = 0;
  let takenDoses = 0;
  let missedDoses = 0;
  let skippedDoses = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    if (dateStr > today.toISOString().split('T')[0]) continue;

    const schedule = buildDaySchedule(medicines, logs, date);
    const dayTotal = schedule.length;
    const dayTaken = schedule.filter(d => d.status === 'taken').length;
    const dayMissed = schedule.filter(d => d.status === 'missed').length;
    const daySkipped = schedule.filter(d => d.status === 'skipped').length;

    totalDoses += dayTotal;
    takenDoses += dayTaken;
    missedDoses += dayMissed;
    skippedDoses += daySkipped;

    dailyData.push({
      date: dateStr,
      rate: dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0,
      taken: dayTaken,
      total: dayTotal,
    });
  }

  const last7 = dailyData.slice(-7);
  const last7Total = last7.reduce((a, d) => a + d.total, 0);
  const last7Taken = last7.reduce((a, d) => a + d.taken, 0);

  const last30Total = dailyData.reduce((a, d) => a + d.total, 0);
  const last30Taken = dailyData.reduce((a, d) => a + d.taken, 0);

  // Compute streak
  let streak = 0;
  let longestStreak = 0;
  let current = 0;
  for (let i = dailyData.length - 1; i >= 0; i--) {
    const d = dailyData[i];
    if (d.total === 0 || d.rate >= 80) {
      current++;
      if (i === dailyData.length - 1 || i === dailyData.length - 2) streak = current;
    } else {
      if (current > longestStreak) longestStreak = current;
      current = 0;
    }
  }
  if (current > longestStreak) longestStreak = current;

  return {
    overall: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0,
    last7Days: last7Total > 0 ? Math.round((last7Taken / last7Total) * 100) : 0,
    last30Days: last30Total > 0 ? Math.round((last30Taken / last30Total) * 100) : 0,
    totalDoses,
    takenDoses,
    missedDoses,
    skippedDoses,
    streak,
    longestStreak,
    dailyAdherence: dailyData,
  };
}

export function getAdherenceLabel(rate: number): { label: string; color: string } {
  if (rate >= 90) return { label: 'Excellent', color: '#3FB950' };
  if (rate >= 75) return { label: 'Good', color: '#00D4AA' };
  if (rate >= 50) return { label: 'Fair', color: '#FFB347' };
  return { label: 'Needs Improvement', color: '#FF6B6B' };
}
