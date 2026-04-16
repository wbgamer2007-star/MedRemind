// Powered by OnSpace.AI
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../hooks/useApp';
import { useTodaySchedule } from '../../hooks/useSchedule';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ProfileAvatar } from '../../components';
import { DoseCard } from '../../components';
import { ProgressRing } from '../../components';
import { Card } from '../../components';
import { formatTime, todayString } from '../../services/medicineService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeProfile, profiles, setActiveProfile, medicines, settings, recordDose } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;
  const schedule = useTodaySchedule();
  const analytics = useAnalytics(7);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const nextDose = schedule.find(d => d.status === 'upcoming' || d.status === 'overdue');
  const takenToday = schedule.filter(d => d.status === 'taken').length;
  const totalToday = schedule.length;
  const adherenceToday = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  async function handleTake(dose: typeof schedule[0]) {
    await recordDose({
      medicineId: dose.medicine.id,
      profileId: activeProfile!.id,
      scheduledTime: dose.time,
      scheduledDate: todayString(),
      status: 'taken',
    });
  }

  async function handleSkip(dose: typeof schedule[0]) {
    await recordDose({
      medicineId: dose.medicine.id,
      profileId: activeProfile!.id,
      scheduledTime: dose.time,
      scheduledDate: todayString(),
      status: 'skipped',
    });
  }

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.headerLeft}>
          <Text style={[s.greeting, { color: C.textSecondary }]}>Good {getGreeting()},</Text>
          <Text style={[s.profileName, { color: C.textPrimary }]}>{activeProfile?.name || 'User'}</Text>
          <Text style={[s.date, { color: C.textTertiary }]}>{dateStr}</Text>
        </View>
        <View style={s.headerRight}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {profiles.map(p => (
              <ProfileAvatar
                key={p.id} profile={p}
                isActive={p.id === activeProfile?.id}
                onPress={() => setActiveProfile(p)}
                size={36}
              />
            ))}
            <Pressable
              style={[s.addProfileBtn, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push('/profiles')}
            >
              <MaterialIcons name="group-add" size={18} color={C.textSecondary} />
            </Pressable>
          </ScrollView>
          <Pressable onPress={() => router.push('/settings')} style={s.settingsBtn} hitSlop={8}>
            <MaterialIcons name="settings" size={22} color={C.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Today Summary */}
        <View style={[s.summaryCard, { backgroundColor: C.primaryDim, borderColor: C.primaryMid }]}>
          <View style={s.summaryLeft}>
            <Text style={[s.summaryTitle, { color: C.primary }]}>Today's Progress</Text>
            <Text style={[s.summaryCount, { color: C.textPrimary }]}>{takenToday} / {totalToday} doses</Text>
            {nextDose ? (
              <View style={s.nextDoseRow}>
                <MaterialIcons name="access-alarm" size={14} color={C.textSecondary} />
                <Text style={[s.nextDoseText, { color: C.textSecondary }]}>
                  Next: {nextDose.medicine.name} at {formatTime(nextDose.time)}
                </Text>
              </View>
            ) : totalToday > 0 ? (
              <Text style={[s.allDoneText, { color: C.primary }]}>All doses complete! 🎉</Text>
            ) : (
              <Text style={[s.noDosesText, { color: C.textTertiary }]}>No medicines scheduled today</Text>
            )}
          </View>
          <ProgressRing
            size={90} strokeWidth={8}
            progress={adherenceToday}
            color={C.primary}
            trackColor={C.primaryMid}
            label={`${adherenceToday}%`}
            sublabel="today"
            labelColor={C.textPrimary}
          />
        </View>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          <Card style={[s.statCard, { flex: 1 }]} dark={settings.darkMode}>
            <MaterialIcons name="local-fire-department" size={20} color="#FFB347" />
            <Text style={[s.statValue, { color: C.textPrimary }]}>{analytics.streak}</Text>
            <Text style={[s.statLabel, { color: C.textSecondary }]}>Day Streak</Text>
          </Card>
          <Card style={[s.statCard, { flex: 1 }]} dark={settings.darkMode}>
            <MaterialIcons name="trending-up" size={20} color={C.primary} />
            <Text style={[s.statValue, { color: C.textPrimary }]}>{analytics.last7Days}%</Text>
            <Text style={[s.statLabel, { color: C.textSecondary }]}>7-Day Rate</Text>
          </Card>
          <Card style={[s.statCard, { flex: 1 }]} dark={settings.darkMode}>
            <MaterialIcons name="medication" size={20} color={C.purple} />
            <Text style={[s.statValue, { color: C.textPrimary }]}>{medicines.filter(m => m.isActive).length}</Text>
            <Text style={[s.statLabel, { color: C.textSecondary }]}>Active Meds</Text>
          </Card>
        </View>

        {/* Today's Doses */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Today's Schedule</Text>
            <Pressable onPress={() => router.push('/(tabs)/schedule')} hitSlop={8}>
              <Text style={[s.seeAll, { color: C.primary }]}>See All</Text>
            </Pressable>
          </View>
          {schedule.length === 0 ? (
            <Card dark={settings.darkMode} style={s.emptyCard}>
              <MaterialIcons name="medication" size={40} color={C.textTertiary} />
              <Text style={[s.emptyTitle, { color: C.textPrimary }]}>No medicines today</Text>
              <Text style={[s.emptySubtitle, { color: C.textSecondary }]}>Add your first medicine to get started</Text>
              <Pressable
                style={[s.addMedBtn, { backgroundColor: C.primary }]}
                onPress={() => router.push('/add-medicine')}
              >
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={s.addMedBtnText}>Add Medicine</Text>
              </Pressable>
            </Card>
          ) : (
            schedule.slice(0, 5).map((dose, i) => (
              <DoseCard
                key={`${dose.medicine.id}_${dose.time}`}
                dose={dose}
                onTake={() => handleTake(dose)}
                onSkip={() => handleSkip(dose)}
                dark={settings.darkMode}
              />
            ))
          )}
        </View>

        {/* Medicines */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: C.textPrimary }]}>My Medicines</Text>
            <Pressable
              style={[s.addBtn, { backgroundColor: C.primaryDim, borderColor: C.primaryMid }]}
              onPress={() => router.push('/add-medicine')}
            >
              <MaterialIcons name="add" size={16} color={C.primary} />
              <Text style={[s.addBtnText, { color: C.primary }]}>Add</Text>
            </Pressable>
          </View>
          {medicines.length === 0 ? (
            <Text style={[s.noMedText, { color: C.textTertiary }]}>No medicines added yet.</Text>
          ) : (
            medicines.slice(0, 3).map(m => (
              <Pressable
                key={m.id}
                style={[s.medRow, { backgroundColor: C.card, borderColor: C.borderLight }]}
                onPress={() => router.push({ pathname: '/edit-medicine', params: { id: m.id } })}
              >
                <View style={[s.medDot, { backgroundColor: m.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.medName, { color: C.textPrimary }]}>{m.name}</Text>
                  <Text style={[s.medDetail, { color: C.textSecondary }]}>{m.dosage} · {m.times.length}x daily</Text>
                </View>
                <View style={[s.activeBadge, { backgroundColor: m.isActive ? C.successDim : C.surface }]}>
                  <Text style={[s.activeBadgeText, { color: m.isActive ? C.success : C.textTertiary }]}>
                    {m.isActive ? 'Active' : 'Paused'}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginLeft: Spacing.md, marginTop: 4 },
  greeting: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  date: { fontSize: FontSize.sm, marginTop: 2 },
  addProfileBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  settingsBtn: { padding: 4 },
  summaryCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLeft: { flex: 1 },
  summaryTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  summaryCount: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 6 },
  nextDoseRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nextDoseText: { fontSize: FontSize.sm },
  allDoneText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  noDosesText: { fontSize: FontSize.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  statCard: { alignItems: 'center', gap: 4, paddingVertical: Spacing.md },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptySubtitle: { fontSize: FontSize.sm, textAlign: 'center' },
  addMedBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: 10, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  addMedBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm },
  medDot: { width: 10, height: 10, borderRadius: 5 },
  medName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  medDetail: { fontSize: FontSize.sm, marginTop: 2 },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  activeBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  noMedText: { fontSize: FontSize.sm, textAlign: 'center', paddingVertical: Spacing.lg },
});
