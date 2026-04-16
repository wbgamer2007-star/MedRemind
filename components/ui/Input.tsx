// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  dark?: boolean;
  containerStyle?: ViewStyle;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, error, dark = true, containerStyle, prefix, suffix, style, ...props }: InputProps) {
  const C = dark ? Colors.dark : Colors.light;
  const [focused, setFocused] = useState(false);

  return (
    <View style={[s.container, containerStyle]}>
      {label ? <Text style={[s.label, { color: C.textSecondary }]}>{label}</Text> : null}
      <View style={[
        s.inputRow,
        { backgroundColor: C.surface, borderColor: focused ? C.primary : error ? C.error : C.border },
        focused && { borderColor: C.primary },
      ]}>
        {prefix ? <View style={s.prefix}>{prefix}</View> : null}
        <TextInput
          style={[s.input, { color: C.textPrimary, flex: 1 }, style]}
          placeholderTextColor={C.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffix ? <View style={s.suffix}>{suffix}</View> : null}
      </View>
      {error ? <Text style={[s.error, { color: C.error }]}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: BorderRadius.md,
    minHeight: 48, paddingHorizontal: Spacing.md,
  },
  input: { fontSize: FontSize.base, paddingVertical: Spacing.sm },
  prefix: { marginRight: Spacing.sm },
  suffix: { marginLeft: Spacing.sm },
  error: { fontSize: FontSize.sm, marginTop: 4 },
});
