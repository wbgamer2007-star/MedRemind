// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../hooks/useApp';
import { ProfileAvatar } from '../components';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { cancelAllNotifications } from '../services/notificationService';
import { useAlert } from '@/template';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, activeProfile, profiles, setActiveProfile, medicines, doseLogs } = useApp();
  const { showAlert } = useAlert();
  const C = settings.darkMode ? Colors.dark : Colors.light;

  function SettingRow({ icon, title, subtitle, right, onPress }: { icon: string; title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void }) {
    return (
      <Pressable style={[s.settingRow, { borderBottomColor: C.borderLight }]} onPress={onPress} disabled={!onPress}>
        <View style={[s.settingIcon, { backgroundColor: C.primaryDim }]}>
          <MaterialIcons name={icon as any} size={18} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.settingTitle, { color: C.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[s.settingSubtitle, { color: C.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        {right}
      </Pressable>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return <Text style={[s.sectionHeader, { color: C.textTertiary }]}>{title}</Text>;
  }

  function SettingCard({ children }: { children: React.ReactNode }) {
    return <View style={[s.settingCard, { backgroundColor: C.card, borderColor: C.borderLight }]}>{children}</View>;
  }

  return (
    <View style={[s.root, { backgroundColor: C.background, paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.textSecondary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Active Profile */}
        {activeProfile ? (
          <>
            <SectionHeader title="ACTIVE PROFILE" />
            <SettingCard>
              <View style={s.profileRow}>
                <ProfileAvatar profile={activeProfile} isActive size={50} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.profileName, { color: C.textPrimary }]}>{activeProfile.name}</Text>
                  <Text style={[s.profileRelation, { color: C.textSecondary }]}>{activeProfile.relation}</Text>
                  <Text style={[s.profileStats, { color: C.textTertiary }]}>
                    {medicines.length} medicines · {doseLogs.length} logs
                  </Text>
                </View>
                <Pressable style={[s.switchBtn, { backgroundColor: C.primaryDim }]} onPress={() => router.push('/profiles')}>
                  <Text style={[s.switchBtnText, { color: C.primary }]}>Switch</Text>
                </Pressable>
              </View>
            </SettingCard>
          </>
        ) : null}

        <SectionHeader title="APPEARANCE" />
        <SettingCard>
          <SettingRow
            icon="dark-mode"
            title="Dark Mode"
            subtitle="Use dark color theme"
            right={
              <Switch
                value={settings.darkMode}
                onValueChange={v => updateSettings({ darkMode: v })}
                trackColor={{ false: C.border, true: C.primaryMid }}
                thumbColor={settings.darkMode ? C.primary : C.textTertiary}
              />
            }
          />
        </SettingCard>

        <SectionHeader title="NOTIFICATIONS" />
        <SettingCard>
          <SettingRow
            icon="notifications"
            title="Enable Reminders"
            subtitle="Receive medication reminders"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={v => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: C.border, true: C.primaryMid }}
                thumbColor={settings.notificationsEnabled ? C.primary : C.textTertiary}
              />
            }
          />
          <SettingRow
            icon="volume-up"
            title="Sound"
            subtitle="Play sound with reminders"
            right={
              <Switch
                value={settings.soundEnabled}
                onValueChange={v => updateSettings({ soundEnabled: v })}
                trackColor={{ false: C.border, true: C.primaryMid }}
                thumbColor={settings.soundEnabled ? C.primary : C.textTertiary}
              />
            }
          />
          <SettingRow
            icon="vibration"
            title="Vibration"
            subtitle="Vibrate with reminders"
            right={
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={v => updateSettings({ vibrationEnabled: v })}
                trackColor={{ false: C.border, true: C.primaryMid }}
                thumbColor={settings.vibrationEnabled ? C.primary : C.textTertiary}
              />
            }
          />
          <SettingRow
            icon="notifications-off"
            title="Cancel All Notifications"
            subtitle="Remove all scheduled reminders"
            onPress={() => {
              showAlert('Cancel Notifications', 'This will remove all scheduled medication reminders. You can re-add them by toggling medicines.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', style: 'destructive', onPress: () => cancelAllNotifications() },
              ]);
            }}
          />
        </SettingCard>

        <SectionHeader title="PROFILES" />
        <SettingCard>
          <SettingRow icon="group" title="Manage Profiles" subtitle={`${profiles.length} profile${profiles.length !== 1 ? 's' : ''}`} onPress={() => router.push('/profiles')} right={<MaterialIcons name="chevron-right" size={20} color={C.textTertiary} />} />
        </SettingCard>

        <SectionHeader title="ABOUT" />
        <SettingCard>
          <SettingRow icon="info" title="MedRemind" subtitle="Version 1.0.0 · Built with OnSpace" />
          <SettingRow icon="security" title="Privacy" subtitle="All data stored locally on device" />
          <SettingRow icon="favorite" title="Made with care for your health" />
        </SettingCard>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  content: { paddingHorizontal: Spacing.lg },
  sectionHeader: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  settingCard: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingSubtitle: { fontSize: FontSize.sm, marginTop: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  profileName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  profileRelation: { fontSize: FontSize.sm, marginTop: 2 },
  profileStats: { fontSize: FontSize.xs, marginTop: 2 },
  switchBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  switchBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
