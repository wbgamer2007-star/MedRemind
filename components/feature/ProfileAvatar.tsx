// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Profile } from '../../services/medicineService';
import { BorderRadius, FontSize, FontWeight } from '../../constants/theme';

interface ProfileAvatarProps {
  profile: Profile;
  isActive?: boolean;
  onPress?: () => void;
  size?: number;
  showName?: boolean;
}

export function ProfileAvatar({ profile, isActive, onPress, size = 40, showName }: ProfileAvatarProps) {
  const content = (
    <View style={{ alignItems: 'center' }}>
      <View style={[
        s.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: profile.color + '25' },
        isActive && { borderWidth: 2.5, borderColor: profile.color },
      ]}>
        <Text style={{ fontSize: size * 0.45 }}>{profile.avatar}</Text>
      </View>
      {showName ? (
        <Text style={[s.name, { color: isActive ? profile.color : '#8B949E', fontSize: FontSize.xs }]} numberOfLines={1}>
          {profile.name.split(' ')[0]}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress} hitSlop={8}>{content}</Pressable>;
  }
  return content;
}

const s = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  name: { marginTop: 4, fontWeight: FontWeight.medium, maxWidth: 56 },
});
