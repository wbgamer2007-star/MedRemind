// Powered by OnSpace.AI
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { storageGet } from '../services/storage';
import { STORAGE_KEYS } from '../constants/config';
import { Colors } from '../constants/theme';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const [onboardingDone, profiles] = await Promise.all([
        storageGet<boolean>(STORAGE_KEYS.ONBOARDING_DONE),
        storageGet<any[]>(STORAGE_KEYS.PROFILES),
      ]);
      if (!onboardingDone || !profiles || profiles.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
    init();
  }, []);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={Colors.dark.primary} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'center' },
});
