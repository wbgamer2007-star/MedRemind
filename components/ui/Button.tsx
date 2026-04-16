// Powered by OnSpace.AI
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  dark?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, textStyle, dark = true,
}: ButtonProps) {
  const C = dark ? Colors.dark : Colors.light;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const containerStyle: ViewStyle = [
    s.base,
    size === 'sm' && s.sm,
    size === 'lg' && s.lg,
    variant === 'primary' && { backgroundColor: C.primary },
    variant === 'secondary' && { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.primary },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    variant === 'danger' && { backgroundColor: C.secondary },
    (disabled || loading) && { opacity: 0.5 },
    style,
  ].filter(Boolean) as ViewStyle;

  const txtStyle: TextStyle = [
    s.text,
    size === 'sm' && s.textSm,
    size === 'lg' && s.textLg,
    variant === 'primary' && { color: C.textInverse },
    variant === 'secondary' && { color: C.textPrimary },
    variant === 'outline' && { color: C.primary },
    variant === 'ghost' && { color: C.textSecondary },
    variant === 'danger' && { color: '#fff' },
    textStyle,
  ].filter(Boolean) as TextStyle;

  return (
    <AnimatedPressable
      style={[containerStyle, animStyle]}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 20, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
      hitSlop={8}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? C.textInverse : C.primary} />
        : <Text style={txtStyle}>{label}</Text>
      }
    </AnimatedPressable>
  );
}

const s = StyleSheet.create({
  base: { height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  sm: { height: 36, paddingHorizontal: Spacing.md },
  lg: { height: 56, paddingHorizontal: Spacing.xl },
  text: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, letterSpacing: 0.2 },
  textSm: { fontSize: FontSize.sm },
  textLg: { fontSize: FontSize.lg },
});
