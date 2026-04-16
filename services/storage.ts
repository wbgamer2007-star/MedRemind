// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function storageRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

export async function storageMerge<T extends object>(key: string, value: Partial<T>): Promise<void> {
  try {
    const existing = await storageGet<T>(key);
    const merged = { ...(existing || {}), ...value };
    await storageSet(key, merged);
  } catch {}
}
