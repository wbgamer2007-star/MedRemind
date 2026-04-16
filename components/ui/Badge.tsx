// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = '#00D4AA', textColor = '#fff', size = 'md' }: BadgeProps) {
  return (
    <View style={[s.badge, size === 'sm' && s.sm, { backgroundColor: color + '25' }]}>
      <Text style={[s.text, size === 'sm' && s.textSm, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  textSm: { fontSize: FontSize.xs },
});
