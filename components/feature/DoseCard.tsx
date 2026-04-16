// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ScheduledDose } from '../../services/medicineService';
import { formatTime } from '../../services/medicineService';
import { MEDICINE_TYPES, MEAL_TIMING } from '../../constants/config';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../../constants/theme';

interface DoseCardProps {
  dose: ScheduledDose;
  onTake?: () => void;
  onSkip?: () => void;
  dark?: boolean;
}

const STATUS_CONFIG = {
  taken: { icon: 'check-circle', label: 'Taken', color: '#3FB950' },
  missed: { icon: 'cancel', label: 'Missed', color: '#F85149' },
  skipped: { icon: 'remove-circle', label: 'Skipped', color: '#FFB347' },
  snoozed: { icon: 'snooze', label: 'Snoozed', color: '#B39DDB' },
  upcoming: { icon: 'radio-button-unchecked', label: 'Upcoming', color: '#8B949E' },
  overdue: { icon: 'error', label: 'Overdue', color: '#FF6B6B' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DoseCard({ dose, onTake, onSkip, dark = true }: DoseCardProps) {
  const C = dark ? Colors.dark : Colors.light;
  const { medicine, time, status } = dose;
  const statusConf = STATUS_CONFIG[status];
  const typeInfo = MEDICINE_TYPES.find(t => t.id === medicine.type);
  const mealInfo = MEAL_TIMING.find(m => m.id === medicine.mealTiming);
  const accentColor = medicine.color || typeInfo?.color || C.primary;
  const isPending = status === 'upcoming' || status === 'overdue';
  const scaleBtn1 = useSharedValue(1);
  const scaleBtn2 = useSharedValue(1);
  const anim1 = useAnimatedStyle(() => ({ transform: [{ scale: scaleBtn1.value }] }));
  const anim2 = useAnimatedStyle(() => ({ transform: [{ scale: scaleBtn2.value }] }));

  return (
    <View style={[s.card, { backgroundColor: C.card, borderColor: status === 'overdue' ? C.secondary + '50' : C.borderLight }]}>
      <View style={[s.timeCol, { borderRightColor: C.borderLight }]}>
        <Text style={[s.time, { color: C.textPrimary }]}>{formatTime(time)}</Text>
        <MaterialIcons name={statusConf.icon as any} size={16} color={statusConf.color} style={{ marginTop: 4 }} />
      </View>
      <View style={[s.dot, { backgroundColor: accentColor }]} />
      <View style={s.content}>
        <View style={s.row}>
          <Text style={[s.name, { color: C.textPrimary }]} numberOfLines={1}>{medicine.name}</Text>
          {status === 'overdue' ? (
            <View style={[s.overdueTag, { backgroundColor: C.secondaryDim }]}>
              <Text style={[s.overdueText, { color: C.secondary }]}>Overdue</Text>
            </View>
          ) : null}
        </View>
        <Text style={[s.detail, { color: C.textSecondary }]}>
          {medicine.dosage} · {typeInfo?.label || medicine.type}
          {mealInfo ? ` · ${mealInfo.label}` : ''}
        </Text>
        {medicine.instructions ? (
          <Text style={[s.instructions, { color: C.textTertiary }]} numberOfLines={1}>
            {medicine.instructions}
          </Text>
        ) : null}
        {isPending && (
          <View style={s.btnRow}>
            <AnimatedPressable
              style={[s.btn, s.takeBtn, anim1, { backgroundColor: C.primary }]}
              onPress={onTake}
              onPressIn={() => { scaleBtn1.value = withSpring(0.94, { damping: 20, stiffness: 400 }); }}
              onPressOut={() => { scaleBtn1.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
            >
              <MaterialIcons name="check" size={14} color="#fff" />
              <Text style={s.btnText}>Take</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[s.btn, s.skipBtn, anim2, { borderColor: C.border }]}
              onPress={onSkip}
              onPressIn={() => { scaleBtn2.value = withSpring(0.94, { damping: 20, stiffness: 400 }); }}
              onPressOut={() => { scaleBtn2.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
            >
              <Text style={[s.btnText, { color: C.textSecondary }]}>Skip</Text>
            </AnimatedPressable>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', borderRadius: BorderRadius.md,
    borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm,
  },
  timeCol: { width: 70, padding: Spacing.md, alignItems: 'center', borderRightWidth: 1 },
  time: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textAlign: 'center' },
  dot: { width: 3, alignSelf: 'stretch' },
  content: { flex: 1, padding: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, flex: 1 },
  detail: { fontSize: FontSize.sm, marginTop: 3 },
  instructions: { fontSize: FontSize.xs, marginTop: 3, fontStyle: 'italic' },
  overdueTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  overdueText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  takeBtn: {},
  skipBtn: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
});
