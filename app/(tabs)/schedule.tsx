// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../hooks/useApp';
import { useSchedule } from '../../hooks/useSchedule';
import { DoseCard } from '../../components';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { todayString } from '../../services/medicineService';

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { settings, activeProfile, recordDose } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const schedule = useSchedule(selectedDate);

  function changeDay(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  }

  const dateStr = selectedDate.toISOString().split('T')[0];
  const isToday = dateStr === todayString();
  const displayDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const takenCount = schedule.filter(d => d.status === 'taken').length;
  const totalCount = schedule.length;

  async function handleDose(dose: typeof schedule[0], status: 'taken' | 'skipped') {
    if (!activeProfile) return;
    await recordDose({
      medicineId: dose.medicine.id,
      profileId: activeProfile.id,
      scheduledTime: dose.time,
      scheduledDate: dateStr,
      status,
    });
  }

  const groupedByPeriod = {
    Morning: schedule.filter(d => { const h = parseInt(d.time.split(':')[0]); return h >= 5 && h < 12; }),
    Afternoon: schedule.filter(d => { const h = parseInt(d.time.split(':')[0]); return h >= 12 && h < 17; }),
    Evening: schedule.filter(d => { const h = parseInt(d.time.split(':')[0]); return h >= 17 && h < 21; }),
    Night: schedule.filter(d => { const h = parseInt(d.time.split(':')[0]); return h >= 21 || h < 5; }),
  };

  return (
    <View style={[s.root, { backgroundColor: C.background, paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: C.textPrimary }]}>Schedule</Text>
        <View style={s.dateNav}>
          <Pressable onPress={() => changeDay(-1)} style={[s.navBtn, { backgroundColor: C.surface }]} hitSlop={8}>
            <MaterialIcons name="chevron-left" size={20} color={C.textSecondary} />
          </Pressable>
          <Pressable onPress={() => setSelectedDate(new Date())} style={[s.datePill, { backgroundColor: isToday ? C.primaryDim : C.surface, borderColor: isToday ? C.primaryMid : C.border }]}>
            <Text style={[s.dateText, { color: isToday ? C.primary : C.textSecondary }]}>{isToday ? 'Today' : displayDate}</Text>
          </Pressable>
          <Pressable onPress={() => changeDay(1)} style={[s.navBtn, { backgroundColor: C.surface }]} hitSlop={8}>
            <MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />
          </Pressable>
        </View>
      </View>

      {!isToday ? (
        <View style={[s.dateBanner, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.dateBannerText, { color: C.textSecondary }]}>{displayDate}</Text>
        </View>
      ) : null}

      <View style={[s.progressBar, { backgroundColor: C.card, borderColor: C.borderLight }]}>
        <Text style={[s.progressText, { color: C.textPrimary }]}>{takenCount}/{totalCount} doses taken</Text>
        <View style={[s.progressTrack, { backgroundColor: C.borderLight }]}>
          <View style={[s.progressFill, { backgroundColor: C.primary, width: totalCount > 0 ? `${Math.round((takenCount / totalCount) * 100)}%` : '0%' as any }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: 100 }]}>
        {schedule.length === 0 ? (
          <View style={s.empty}>
            <MaterialIcons name="event-available" size={48} color={C.textTertiary} />
            <Text style={[s.emptyTitle, { color: C.textPrimary }]}>No doses scheduled</Text>
            <Text style={[s.emptySubtitle, { color: C.textSecondary }]}>No medicines are scheduled for this day</Text>
          </View>
        ) : (
          Object.entries(groupedByPeriod).map(([period, doses]) => {
            if (doses.length === 0) return null;
            const icons: Record<string, string> = { Morning: 'wb-sunny', Afternoon: 'wb-cloudy', Evening: 'brightness-3', Night: 'nightlight' };
            return (
              <View key={period} style={s.periodSection}>
                <View style={s.periodHeader}>
                  <MaterialIcons name={icons[period] as any} size={16} color={C.textSecondary} />
                  <Text style={[s.periodLabel, { color: C.textSecondary }]}>{period}</Text>
                  <View style={[s.periodLine, { backgroundColor: C.borderLight }]} />
                  <Text style={[s.periodCount, { color: C.textTertiary }]}>{doses.filter(d => d.status === 'taken').length}/{doses.length}</Text>
                </View>
                {doses.map(dose => (
                  <DoseCard
                    key={`${dose.medicine.id}_${dose.time}`}
                    dose={dose}
                    onTake={() => handleDose(dose, 'taken')}
                    onSkip={() => handleDose(dose, 'skipped')}
                    dark={settings.darkMode}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  dateNav: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  navBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  datePill: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, alignItems: 'center' },
  dateText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  dateBanner: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  dateBannerText: { fontSize: FontSize.sm },
  progressBar: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  progressText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, minWidth: 100 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  content: { paddingHorizontal: Spacing.lg },
  periodSection: { marginBottom: Spacing.md },
  periodHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  periodLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8 },
  periodLine: { flex: 1, height: 1 },
  periodCount: { fontSize: FontSize.xs },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
  emptySubtitle: { fontSize: FontSize.base, textAlign: 'center' },
});
