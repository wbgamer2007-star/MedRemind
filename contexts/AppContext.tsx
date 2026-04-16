// Powered by OnSpace.AI
import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Medicine, Profile, DoseLog, getProfiles, getMedicines, getDoseLogs, saveProfile, saveMedicine, deleteMedicine as deleteMed, deleteProfile as deletePro, logDose, generateId, todayString } from '../services/medicineService';
import { storageGet, storageSet } from '../services/storage';
import { STORAGE_KEYS, PROFILE_COLORS, PROFILE_AVATARS } from '../constants/config';

export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface AppContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  medicines: Medicine[];
  doseLogs: DoseLog[];
  settings: AppSettings;
  isLoading: boolean;
  setActiveProfile: (profile: Profile) => void;
  addProfile: (name: string, avatar: string, color: string, relation: string) => Promise<Profile>;
  updateProfile: (profile: Profile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt'>) => Promise<Medicine>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  removeMedicine: (id: string) => Promise<void>;
  recordDose: (log: Omit<DoseLog, 'id' | 'loggedAt'>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [profs, savedSettings, savedActiveId] = await Promise.all([
        getProfiles(),
        storageGet<AppSettings>(STORAGE_KEYS.SETTINGS),
        storageGet<string>(STORAGE_KEYS.ACTIVE_PROFILE),
      ]);

      if (savedSettings) setSettings(savedSettings);

      let activeProf: Profile | null = null;
      if (profs.length > 0) {
        activeProf = profs.find(p => p.id === savedActiveId) || profs[0];
        setProfiles(profs);
        setActiveProfileState(activeProf);
      }

      if (activeProf) {
        const [meds, logs] = await Promise.all([
          getMedicines(activeProf.id),
          getDoseLogs(activeProf.id),
        ]);
        setMedicines(meds);
        setDoseLogs(logs);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const setActiveProfile = useCallback(async (profile: Profile) => {
    setActiveProfileState(profile);
    await storageSet(STORAGE_KEYS.ACTIVE_PROFILE, profile.id);
    const [meds, logs] = await Promise.all([
      getMedicines(profile.id),
      getDoseLogs(profile.id),
    ]);
    setMedicines(meds);
    setDoseLogs(logs);
  }, []);

  const addProfile = useCallback(async (name: string, avatar: string, color: string, relation: string): Promise<Profile> => {
    const profile: Profile = {
      id: generateId(),
      name,
      avatar,
      color,
      relation,
      isDefault: profiles.length === 0,
      createdAt: new Date().toISOString(),
    };
    await saveProfile(profile);
    const updated = [...profiles, profile];
    setProfiles(updated);
    if (updated.length === 1) {
      setActiveProfileState(profile);
      await storageSet(STORAGE_KEYS.ACTIVE_PROFILE, profile.id);
    }
    return profile;
  }, [profiles]);

  const updateProfile = useCallback(async (profile: Profile) => {
    await saveProfile(profile);
    setProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
    if (activeProfile?.id === profile.id) setActiveProfileState(profile);
  }, [activeProfile]);

  const removeProfile = useCallback(async (id: string) => {
    await deletePro(id);
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    if (activeProfile?.id === id && updated.length > 0) {
      setActiveProfile(updated[0]);
    }
  }, [profiles, activeProfile, setActiveProfile]);

  const addMedicine = useCallback(async (data: Omit<Medicine, 'id' | 'createdAt'>): Promise<Medicine> => {
    const medicine: Medicine = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    await saveMedicine(medicine);
    setMedicines(prev => [...prev, medicine]);
    return medicine;
  }, []);

  const updateMedicine = useCallback(async (medicine: Medicine) => {
    await saveMedicine(medicine);
    setMedicines(prev => prev.map(m => m.id === medicine.id ? medicine : m));
  }, []);

  const removeMedicine = useCallback(async (id: string) => {
    await deleteMed(id);
    setMedicines(prev => prev.filter(m => m.id !== id));
  }, []);

  const recordDose = useCallback(async (data: Omit<DoseLog, 'id' | 'loggedAt'>) => {
    const log: DoseLog = { ...data, id: generateId(), loggedAt: new Date().toISOString() };
    await logDose(log);
    setDoseLogs(prev => {
      const idx = prev.findIndex(
        l => l.medicineId === log.medicineId &&
          l.scheduledDate === log.scheduledDate &&
          l.scheduledTime === log.scheduledTime
      );
      if (idx >= 0) { const n = [...prev]; n[idx] = log; return n; }
      return [...prev, log];
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await storageSet(STORAGE_KEYS.SETTINGS, newSettings);
  }, [settings]);

  const refreshData = useCallback(async () => {
    if (!activeProfile) return;
    const [meds, logs] = await Promise.all([
      getMedicines(activeProfile.id),
      getDoseLogs(activeProfile.id),
    ]);
    setMedicines(meds);
    setDoseLogs(logs);
  }, [activeProfile]);

  return (
    <AppContext.Provider value={{
      profiles, activeProfile, medicines, doseLogs, settings, isLoading,
      setActiveProfile, addProfile, updateProfile, removeProfile,
      addMedicine, updateMedicine, removeMedicine,
      recordDose, updateSettings, refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}
