// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../hooks/useApp';
import { buildDaySchedule } from '../../services/medicineService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { settings, medicines, doseLogs, activeProfile, recordDose } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;
  const today = new Date();
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);

  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: Array<{ date: string | null; day: number | null }> = [];
    for (let i = 0; i < startPad; i++) days.push({ date: null, day: null });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d).toISOString().split('T')[0];
      days.push({ date, day: d });
    }
    return days;
  }, [viewMonth]);

  const dayStatus = useMemo(() => {
    const map: Record<string, { rate: number; total: number; taken: number }> = {};
    calendarDays.forEach(({ date }) => {
      if (!date) return;
      const d = new Date(date + 'T00:00:00');
      const schedule = buildDaySchedule(medicines, doseLogs, d);
      if (schedule.length === 0) return;
      const taken = schedule.filter(s => s.status === 'taken').length;
      map[date] = { total: schedule.length, taken, rate: Math.round((taken / schedule.length) * 100) };
    });
    return map;
  }, [calendarDays, medicines, doseLogs]);

  const selectedSchedule = useMemo(() => {
    if (!selectedDate) return [];
    const d = new Date(selectedDate + 'T00:00:00');
    return buildDaySchedule(medicines, doseLogs, d);
  }, [selectedDate, medicines, doseLogs]);

  function changeMonth(delta: number) {
    setViewMonth(prev => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  }

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = today.toISOString().split('T')[0];

  function getDotColor(date: string): string | null {
    const s = dayStatus[date];
    if (!s) return null;
    if (s.rate >= 90) return C.success;
    if (s.rate >= 60) return C.primary;
    if (s.rate >= 1) return C.accent;
    return C.error;
  }

  return (
    <View style={[s.root, { backgroundColor: C.background, paddingTop: insets.top }]}>
      <Text style={[s.title, { color: C.textPrimary }]}>Calendar</Text>

      {/* Month Navigator */}
      <View style={[s.monthNav, { backgroundColor: C.card, borderColor: C.borderLight }]}>
        <Pressable onPress={() => changeMonth(-1)} hitSlop={12} style={s.navBtn}>
          <MaterialIcons name="chevron-left" size={24} color={C.textSecondary} />
        </Pressable>
        <Text style={[s.monthLabel, { color: C.textPrimary }]}>{monthLabel}</Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={12} style={s.navBtn}>
          <MaterialIcons name="chevron-right" size={24} color={C.textSecondary} />
        </Pressable>
      </View>

      {/* Week labels */}
      <View style={s.weekRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <Text key={d} style={[s.weekLabel, { color: C.textTertiary }]}>{d}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={s.grid}>
        {calendarDays.map((item, i) => {
          if (!item.date || !item.day) {
            return <View key={`pad_${i}`} style={s.dayCell} />;
          }
          const isSelected = item.date === selectedDate;
          const isToday = item.date === todayStr;
          const isFuture = item.date > todayStr;
          const dotColor = getDotColor(item.date);

          return (
            <Pressable
              key={item.date}
              style={[
                s.dayCell,
                isSelected && [s.selectedCell, { backgroundColor: C.primary }],
                isToday && !isSelected && { borderWidth: 1.5, borderColor: C.primary, borderRadius: BorderRadius.md },
              ]}
              onPress={() => setSelectedDate(item.date!)}
            >
              <Text style={[s.dayNum, { color: isSelected ? '#fff' : isFuture ? C.textTertiary : C.textPrimary }]}>
                {item.day}
              </Text>
              {dotColor && !isSelected ? (
                <View style={[s.statusDot, { backgroundColor: dotColor }]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={s.legendRow}>
        {[{ color: C.success, label: '≥90%' }, { color: C.primary, label: '60-90%' }, { color: C.accent, label: '1-60%' }, { color: C.error, label: 'Missed' }].map(l => (
          <View key={l.label} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: l.color }]} />
            <Text style={[s.legendText, { color: C.textTertiary }]}>{l.label}</Text>
          </View>
        ))}
      </View>

      {/* Selected day doses */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: Spacing.lg }}>
        <Text style={[s.selectedDateLabel, { color: C.textSecondary }]}>
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {selectedSchedule.length === 0 ? (
          <Text style={[s.noDoses, { color: C.textTertiary }]}>No doses scheduled</Text>
        ) : (
          selectedSchedule.map(dose => {
            const statusColors: Record<string, string> = { taken: C.success, missed: C.error, skipped: C.accent, upcoming: C.textTertiary, overdue: C.secondary, snoozed: C.purple };
            const color = statusColors[dose.status] || C.textTertiary;
            return (
              <View key={`${dose.medicine.id}_${dose.time}`} style={[s.doseRow, { backgroundColor: C.card, borderColor: C.borderLight }]}>
                <View style={[s.doseDot, { backgroundColor: dose.medicine.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.doseName, { color: C.textPrimary }]}>{dose.medicine.name}</Text>
                  <Text style={[s.doseTime, { color: C.textSecondary }]}>{dose.time}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[s.statusText, { color }]}>{dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}</Text>
                </View>
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
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 8, marginBottom: Spacing.sm },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  weekRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  selectedCell: { borderRadius: BorderRadius.md },
  dayNum: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  statusDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs },
  selectedDateLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  noDoses: { fontSize: FontSize.base, textAlign: 'center', paddingVertical: Spacing.xl },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm },
  doseDot: { width: 10, height: 10, borderRadius: 5 },
  doseName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  doseTime: { fontSize: FontSize.sm, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
