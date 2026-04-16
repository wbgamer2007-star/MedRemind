// Powered by OnSpace.AI
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useApp } from '../../hooks/useApp';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { settings } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;

  const tabBarStyle = {
    height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
    paddingHorizontal: 16,
    backgroundColor: C.tabBar,
    borderTopWidth: 1,
    borderTopColor: C.tabBarBorder,
  };

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.textTertiary,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
      }} />
      <Tabs.Screen name="schedule" options={{
        title: 'Schedule',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="schedule" size={size} color={color} />,
      }} />
      <Tabs.Screen name="calendar" options={{
        title: 'Calendar',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-today" size={size} color={color} />,
      }} />
      <Tabs.Screen name="history" options={{
        title: 'History',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="history" size={size} color={color} />,
      }} />
      <Tabs.Screen name="analytics" options={{
        title: 'Insights',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="insights" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
