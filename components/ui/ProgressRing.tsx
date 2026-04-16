// Powered by OnSpace.AI
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { FontSize, FontWeight } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor: string;
  label?: string;
  sublabel?: string;
  labelColor?: string;
}

export function ProgressRing({
  size, strokeWidth, progress, color, trackColor,
  label, sublabel, labelColor = '#E6EDF3',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value / 100),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={trackColor} strokeWidth={strokeWidth} fill="none"
        />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={s.center}>
        {label ? <Text style={[s.label, { color: labelColor }]}>{label}</Text> : null}
        {sublabel ? <Text style={[s.sublabel, { color: labelColor + '80' }]}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center' },
  label: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  sublabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: 2 },
});
