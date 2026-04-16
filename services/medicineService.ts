// Powered by OnSpace.AI
import { storageGet, storageSet } from './storage';
import { STORAGE_KEYS } from '../constants/config';

export interface Medicine {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  type: string;
  frequency: string;
  customDays?: number[];
  times: string[];
  mealTiming: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  color: string;
  isActive: boolean;
  notificationIds?: string[];
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  profileId: string;
  scheduledTime: string;
  scheduledDate: string;
  status: 'taken' | 'missed' | 'skipped' | 'snoozed';
  loggedAt: string;
  notes?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  relation: string;
  isDefault: boolean;
  createdAt: string;
}

export async function getMedicines(profileId: string): Promise<Medicine[]> {
  const all = await storageGet<Medicine[]>(STORAGE_KEYS.MEDICINES);
  return (all || []).filter(m => m.profileId === profileId);
}

export async function getAllMedicines(): Promise<Medicine[]> {
  return (await storageGet<Medicine[]>(STORAGE_KEYS.MEDICINES)) || [];
}

export async function saveMedicine(medicine: Medicine): Promise<void> {
  const all = await getAllMedicines();
  const idx = all.findIndex(m => m.id === medicine.id);
  if (idx >= 0) all[idx] = medicine;
  else all.push(medicine);
  await storageSet(STORAGE_KEYS.MEDICINES, all);
}

export async function deleteMedicine(id: string): Promise<void> {
  const all = await getAllMedicines();
  await storageSet(STORAGE_KEYS.MEDICINES, all.filter(m => m.id !== id));
}

export async function getDoseLogs(profileId: string): Promise<DoseLog[]> {
  const all = await storageGet<DoseLog[]>(STORAGE_KEYS.DOSE_LOGS);
  return (all || []).filter(l => l.profileId === profileId);
}

export async function getAllDoseLogs(): Promise<DoseLog[]> {
  return (await storageGet<DoseLog[]>(STORAGE_KEYS.DOSE_LOGS)) || [];
}

export async function logDose(log: DoseLog): Promise<void> {
  const all = await getAllDoseLogs();
  const idx = all.findIndex(
    l => l.medicineId === log.medicineId &&
      l.scheduledDate === log.scheduledDate &&
      l.scheduledTime === log.scheduledTime
  );
  if (idx >= 0) all[idx] = log;
  else all.push(log);
  await storageSet(STORAGE_KEYS.DOSE_LOGS, all);
}

export async function getProfiles(): Promise<Profile[]> {
  return (await storageGet<Profile[]>(STORAGE_KEYS.PROFILES)) || [];
}

export async function saveProfile(profile: Profile): Promise<void> {
  const all = await getProfiles();
  const idx = all.findIndex(p => p.id === profile.id);
  if (idx >= 0) all[idx] = profile;
  else all.push(profile);
  await storageSet(STORAGE_KEYS.PROFILES, all);
}

export async function deleteProfile(id: string): Promise<void> {
  const all = await getProfiles();
  await storageSet(STORAGE_KEYS.PROFILES, all.filter(p => p.id !== id));
}

export function getMedicinesForDate(medicines: Medicine[], date: Date): Medicine[] {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();
  return medicines.filter(m => {
    if (!m.isActive) return false;
    if (m.startDate > dateStr) return false;
    if (m.endDate && m.endDate < dateStr) return false;
    if (m.frequency === 'daily') return true;
    if (m.frequency === 'twice_daily') return true;
    if (m.frequency === 'thrice_daily') return true;
    if (m.frequency === 'weekly') return (m.customDays || []).includes(dayOfWeek);
    if (m.frequency === 'custom') return (m.customDays || []).includes(dayOfWeek);
    if (m.frequency === 'as_needed') return false;
    return true;
  });
}

export interface ScheduledDose {
  medicine: Medicine;
  time: string;
  status: 'taken' | 'missed' | 'skipped' | 'snoozed' | 'upcoming' | 'overdue';
  log?: DoseLog;
}

export function buildDaySchedule(
  medicines: Medicine[],
  logs: DoseLog[],
  date: Date
): ScheduledDose[] {
  const dateStr = date.toISOString().split('T')[0];
  const now = new Date();
  const dayMeds = getMedicinesForDate(medicines, date);
  const doses: ScheduledDose[] = [];

  for (const med of dayMeds) {
    for (const time of med.times) {
      const log = logs.find(
        l => l.medicineId === med.id && l.scheduledDate === dateStr && l.scheduledTime === time
      );
      let status: ScheduledDose['status'] = 'upcoming';
      if (log) {
        status = log.status;
      } else {
        const [h, m] = time.split(':').map(Number);
        const schedTime = new Date(date);
        schedTime.setHours(h, m, 0, 0);
        if (dateStr < now.toISOString().split('T')[0]) status = 'missed';
        else if (dateStr === now.toISOString().split('T')[0] && schedTime < now) status = 'overdue';
      }
      doses.push({ medicine: med, time, status, log });
    }
  }
  return doses.sort((a, b) => a.time.localeCompare(b.time));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
