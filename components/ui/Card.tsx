// Powered by OnSpace.AI
import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, BorderRadius, Shadow, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  dark?: boolean;
  elevated?: boolean;
  noPadding?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ children, onPress, style, dark = true, elevated, noPadding }: CardProps) {
  const C = dark ? Colors.dark : Colors.light;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? C.cardElevated : C.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: noPadding ? 0 : Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  };

  if (!onPress) {
    return <View style={[cardStyle, style]}>{children}</View>;
  }

  return (
    <AnimatedPressable
      style={[cardStyle, animStyle, style]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 20, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
    >
      {children}
    </AnimatedPressable>
  );
}
