// Powered by OnSpace.AI
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medicine } from './medicineService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicine-reminders', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D4AA',
      sound: 'default',
    });
  }
  return true;
}

export async function scheduleMedicineNotification(
  medicine: Medicine,
  time: string,
  profileName: string
): Promise<string[]> {
  const ids: string[] = [];
  try {
    const [hour, minute] = time.split(':').map(Number);
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${medicine.name}`,
        body: `${medicine.dosage} ${medicine.type} — ${profileName}. Tap to log your dose.`,
        sound: 'default',
        data: { medicineId: medicine.id, time },
        categoryIdentifier: 'medicine-reminder',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    ids.push(notifId);
  } catch {}
  return ids;
}

export async function cancelNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: null,
    });
  } catch {}
}
