// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../hooks/useApp';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { formatTime } from '../../services/medicineService';

const STATUS_CONFIG = {
  taken: { icon: 'check-circle', color: '#3FB950', label: 'Taken' },
  missed: { icon: 'cancel', color: '#F85149', label: 'Missed' },
  skipped: { icon: 'remove-circle', color: '#FFB347', label: 'Skipped' },
  snoozed: { icon: 'snooze', color: '#B39DDB', label: 'Snoozed' },
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { settings, doseLogs, medicines } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    const sorted = [...doseLogs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
    if (filterStatus === 'all') return sorted;
    return sorted.filter(l => l.status === filterStatus);
  }, [doseLogs, filterStatus]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(log => {
      if (!groups[log.scheduledDate]) groups[log.scheduledDate] = [];
      groups[log.scheduledDate].push(log);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, logs]) => ({ date, logs }));
  }, [filtered]);

  const filters = ['all', 'taken', 'missed', 'skipped'];

  return (
    <View style={[s.root, { backgroundColor: C.background, paddingTop: insets.top }]}>
      <Text style={[s.title, { color: C.textPrimary }]}>History</Text>

      {/* Filter Pills */}
      <View style={s.filterRow}>
        {filters.map(f => (
          <Pressable
            key={f}
            style={[s.filterBtn, filterStatus === f && { backgroundColor: C.primary }]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[s.filterText, { color: filterStatus === f ? '#fff' : C.textSecondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {grouped.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="history" size={48} color={C.textTertiary} />
          <Text style={[s.emptyTitle, { color: C.textPrimary }]}>No history yet</Text>
          <Text style={[s.emptySubtitle, { color: C.textSecondary }]}>Start logging your doses to see history here</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={item => item.date}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const dateLabel = new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            const takenCount = item.logs.filter(l => l.status === 'taken').length;
            return (
              <View style={s.group}>
                <View style={s.dateHeader}>
                  <Text style={[s.dateLabel, { color: C.textSecondary }]}>{dateLabel}</Text>
                  <Text style={[s.dateStats, { color: C.textTertiary }]}>{takenCount}/{item.logs.length} taken</Text>
                </View>
                {item.logs.map(log => {
                  const med = medicines.find(m => m.id === log.medicineId);
                  const conf = STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG];
                  if (!med || !conf) return null;
                  const logTime = new Date(log.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  return (
                    <View key={log.id} style={[s.logRow, { backgroundColor: C.card, borderColor: C.borderLight }]}>
                      <View style={[s.logDot, { backgroundColor: med.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.logName, { color: C.textPrimary }]}>{med.name}</Text>
                        <Text style={[s.logDetail, { color: C.textSecondary }]}>
                          Scheduled {formatTime(log.scheduledTime)}
                          {log.status === 'taken' ? ` · Logged ${logTime}` : ''}
                        </Text>
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: conf.color + '20' }]}>
                        <MaterialIcons name={conf.icon as any} size={13} color={conf.color} />
                        <Text style={[s.statusText, { color: conf.color }]}>{conf.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.06)' },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  group: { marginBottom: Spacing.lg },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  dateLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8 },
  dateStats: { fontSize: FontSize.xs },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  logDetail: { fontSize: FontSize.sm, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
  emptySubtitle: { fontSize: FontSize.base, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
