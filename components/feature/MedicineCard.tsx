// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Medicine, formatTime } from '../../services/medicineService';
import { MEDICINE_TYPES } from '../../constants/config';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../../constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface MedicineCardProps {
  medicine: Medicine;
  onPress?: () => void;
  onToggleActive?: () => void;
  dark?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MedicineCard({ medicine, onPress, onToggleActive, dark = true }: MedicineCardProps) {
  const C = dark ? Colors.dark : Colors.light;
  const typeInfo = MEDICINE_TYPES.find(t => t.id === medicine.type);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const accentColor = medicine.color || typeInfo?.color || C.primary;

  return (
    <AnimatedPressable
      style={[s.card, animStyle, { backgroundColor: C.card, borderColor: C.borderLight }]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
    >
      <View style={[s.colorBar, { backgroundColor: accentColor }]} />
      <View style={[s.iconWrap, { backgroundColor: accentColor + '20' }]}>
        <MaterialIcons name={(typeInfo?.icon as any) || 'pill'} size={22} color={accentColor} />
      </View>
      <View style={s.info}>
        <Text style={[s.name, { color: C.textPrimary }]} numberOfLines={1}>{medicine.name}</Text>
        <Text style={[s.dosage, { color: C.textSecondary }]}>{medicine.dosage} · {typeInfo?.label || medicine.type}</Text>
        <View style={s.timeRow}>
          {medicine.times.map((t, i) => (
            <View key={i} style={[s.timeBadge, { backgroundColor: accentColor + '15' }]}>
              <MaterialIcons name="access-time" size={11} color={accentColor} />
              <Text style={[s.timeText, { color: accentColor }]}>{formatTime(t)}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.actions}>
        <Pressable
          onPress={onToggleActive}
          style={[s.toggle, { backgroundColor: medicine.isActive ? C.primaryDim : C.surface }]}
          hitSlop={8}
        >
          <View style={[s.toggleDot, { backgroundColor: medicine.isActive ? C.primary : C.textTertiary }]} />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg,
    borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm,
  },
  colorBar: { width: 4, alignSelf: 'stretch' },
  iconWrap: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', margin: Spacing.md },
  info: { flex: 1, paddingVertical: Spacing.md },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  dosage: { fontSize: FontSize.sm, marginTop: 2 },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  timeText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  actions: { paddingRight: Spacing.md },
  toggle: { width: 36, height: 20, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 3 },
  toggleDot: { width: 14, height: 14, borderRadius: 7 },
});
