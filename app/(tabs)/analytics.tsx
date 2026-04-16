// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../hooks/useApp';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ProgressRing, Card } from '../../components';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { getAdherenceLabel } from '../../services/analyticsService';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;
  const [period, setPeriod] = useState<7 | 30>(7);
  const analytics = useAnalytics(period);
  const { label: adherenceLabel, color: adherenceColor } = getAdherenceLabel(analytics.overall);

  const barMax = Math.max(...analytics.dailyAdherence.map(d => d.total), 1);

  return (
    <ScrollView
      style={[s.root, { backgroundColor: C.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: insets.top }}>
        <Text style={[s.title, { color: C.textPrimary }]}>Insights</Text>

        {/* Period Selector */}
        <View style={[s.periodRow, { backgroundColor: C.card, borderColor: C.borderLight }]}>
          {([7, 30] as const).map(p => (
            <Pressable key={p}
              style={[s.periodBtn, period === p && { backgroundColor: C.primary }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.periodText, { color: period === p ? '#fff' : C.textSecondary }]}>
                {p === 7 ? 'Last 7 Days' : 'Last 30 Days'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Main Adherence Ring */}
        <Card style={s.mainCard} dark={settings.darkMode}>
          <ProgressRing
            size={140} strokeWidth={12}
            progress={analytics.overall}
            color={adherenceColor}
            trackColor={C.borderLight}
            label={`${analytics.overall}%`}
            sublabel="adherence"
            labelColor={C.textPrimary}
          />
          <View style={s.mainCardRight}>
            <View style={[s.adherenceBadge, { backgroundColor: adherenceColor + '20' }]}>
              <Text style={[s.adherenceLabel, { color: adherenceColor }]}>{adherenceLabel}</Text>
            </View>
            <Text style={[s.overallTitle, { color: C.textPrimary }]}>Overall Rate</Text>
            <Text style={[s.overallDesc, { color: C.textSecondary }]}>
              {analytics.takenDoses} of {analytics.totalDoses} doses taken
            </Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {[
            { icon: 'check-circle', color: C.success, value: analytics.takenDoses, label: 'Taken', bg: C.successDim },
            { icon: 'cancel', color: C.error, value: analytics.missedDoses, label: 'Missed', bg: C.errorDim },
            { icon: 'remove-circle', color: C.accent, value: analytics.skippedDoses, label: 'Skipped', bg: C.accentDim },
            { icon: 'local-fire-department', color: '#FFB347', value: analytics.streak, label: 'Streak', bg: 'rgba(255,179,71,0.15)' },
          ].map(stat => (
            <Card key={stat.label} style={s.statCard} dark={settings.darkMode}>
              <View style={[s.statIcon, { backgroundColor: stat.bg }]}>
                <MaterialIcons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[s.statValue, { color: C.textPrimary }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Daily Bar Chart */}
        <View style={[s.chartCard, { backgroundColor: C.card, borderColor: C.borderLight }]}>
          <Text style={[s.chartTitle, { color: C.textPrimary }]}>Daily Adherence</Text>
          <View style={s.barChart}>
            {analytics.dailyAdherence.slice(-14).map((day, i) => {
              const barH = day.total > 0 ? Math.max(4, (day.rate / 100) * 80) : 4;
              const color = day.total === 0 ? C.borderLight : day.rate >= 90 ? C.success : day.rate >= 60 ? C.primary : day.rate >= 1 ? C.accent : C.error;
              const d = new Date(day.date + 'T00:00:00');
              return (
                <View key={day.date} style={s.barGroup}>
                  <Text style={[s.barLabel, { color: C.textTertiary }]}>{d.getDate()}</Text>
                  <View style={s.barTrack}>
                    <View style={[s.bar, { height: barH, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}
          </View>
          <View style={s.barLegend}>
            {[
              { color: C.success, label: 'Excellent (≥90%)' },
              { color: C.primary, label: 'Good (60-90%)' },
              { color: C.error, label: 'Poor (<60%)' },
            ].map(l => (
              <View key={l.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: l.color }]} />
                <Text style={[s.legendText, { color: C.textTertiary }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Streak Card */}
        <Card style={s.streakCard} dark={settings.darkMode}>
          <View style={s.streakRow}>
            <View>
              <Text style={[s.streakLabel, { color: C.textSecondary }]}>Current Streak</Text>
              <View style={s.streakValueRow}>
                <MaterialIcons name="local-fire-department" size={28} color="#FFB347" />
                <Text style={[s.streakValue, { color: C.textPrimary }]}>{analytics.streak} days</Text>
              </View>
            </View>
            <View style={[s.streakDivider, { backgroundColor: C.borderLight }]} />
            <View>
              <Text style={[s.streakLabel, { color: C.textSecondary }]}>Longest Streak</Text>
              <View style={s.streakValueRow}>
                <MaterialIcons name="emoji-events" size={28} color="#FFD700" />
                <Text style={[s.streakValue, { color: C.textPrimary }]}>{analytics.longestStreak} days</Text>
              </View>
            </View>
          </View>
          <Text style={[s.streakTip, { color: C.textTertiary }]}>
            {analytics.streak >= 7
              ? 'Outstanding consistency! Keep it up.'
              : analytics.streak >= 3
              ? 'Great job! You are building a habit.'
              : 'Take your medicines daily to build your streak.'}
          </Text>
        </Card>

        {/* Weekly Summary */}
        <View style={[s.weeklyCard, { backgroundColor: C.card, borderColor: C.borderLight }]}>
          <Text style={[s.chartTitle, { color: C.textPrimary }]}>This Week</Text>
          <View style={s.weeklyRings}>
            {analytics.dailyAdherence.slice(-7).map((day, i) => {
              const d = new Date(day.date + 'T00:00:00');
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const color = day.total === 0 ? C.borderLight : day.rate >= 90 ? C.success : day.rate >= 60 ? C.primary : C.error;
              return (
                <View key={day.date} style={s.weeklyRingItem}>
                  <ProgressRing
                    size={44} strokeWidth={4}
                    progress={day.total === 0 ? 0 : day.rate}
                    color={color}
                    trackColor={C.borderLight}
                    labelColor={C.textSecondary}
                  />
                  <Text style={[s.weekDayLabel, { color: C.textTertiary }]}>{dayName}</Text>
                  <Text style={[s.weekRateLabel, { color: C.textSecondary }]}>
                    {day.total === 0 ? '-' : `${day.rate}%`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  periodRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, borderRadius: BorderRadius.full, borderWidth: 1, padding: 4, marginBottom: Spacing.md },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.full, alignItems: 'center' },
  periodText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  mainCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, paddingVertical: Spacing.xl },
  mainCardRight: { flex: 1, gap: 6 },
  adherenceBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  adherenceLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  overallTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  overallDesc: { fontSize: FontSize.sm },
  statsGrid: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.md },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center' },
  chartCard: { marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md },
  chartTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, marginBottom: Spacing.md },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100, marginBottom: Spacing.md },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barLabel: { fontSize: 9 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%', borderRadius: 3, minHeight: 4 },
  barLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs },
  streakCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  streakLabel: { fontSize: FontSize.sm, marginBottom: 4 },
  streakValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  streakDivider: { width: 1, height: 60 },
  streakTip: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  weeklyCard: { marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md },
  weeklyRings: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  weeklyRingItem: { alignItems: 'center', gap: 4 },
  weekDayLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  weekRateLabel: { fontSize: 9 },
});
