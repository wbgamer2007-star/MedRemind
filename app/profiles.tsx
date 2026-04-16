// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../hooks/useApp';
import { useAlert } from '@/template';
import { ProfileAvatar } from '../components';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { PROFILE_COLORS, PROFILE_AVATARS } from '../constants/config';

export default function ProfilesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, profiles, activeProfile, setActiveProfile, addProfile, removeProfile } = useApp();
  const { showAlert } = useAlert();
  const C = settings.darkMode ? Colors.dark : Colors.light;

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Family');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedColor, setSelectedColor] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleAddProfile() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const profile = await addProfile(name.trim(), PROFILE_AVATARS[selectedAvatar], PROFILE_COLORS[selectedColor], relation);
      setShowAdd(false);
      setName('');
      await setActiveProfile(profile);
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteProfile(id: string) {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;
    showAlert('Remove Profile', `Remove "${prof.name}" profile? Their medicine data will also be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeProfile(id) },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.textSecondary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>Family Profiles</Text>
        <Pressable onPress={() => setShowAdd(true)} style={[s.addBtn, { backgroundColor: C.primaryDim }]} hitSlop={8}>
          <MaterialIcons name="person-add" size={18} color={C.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={[s.subtitle, { color: C.textSecondary }]}>
          Manage medicine schedules for yourself and your family members
        </Text>

        {profiles.map(profile => (
          <Pressable
            key={profile.id}
            style={[s.profileCard, { backgroundColor: C.card, borderColor: activeProfile?.id === profile.id ? profile.color : C.borderLight }]}
            onPress={() => { setActiveProfile(profile); router.back(); }}
          >
            <ProfileAvatar profile={profile} isActive={activeProfile?.id === profile.id} size={52} />
            <View style={{ flex: 1 }}>
              <View style={s.profileNameRow}>
                <Text style={[s.profileName, { color: C.textPrimary }]}>{profile.name}</Text>
                {activeProfile?.id === profile.id ? (
                  <View style={[s.activeBadge, { backgroundColor: profile.color + '20' }]}>
                    <Text style={[s.activeBadgeText, { color: profile.color }]}>Active</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[s.profileRelation, { color: C.textSecondary }]}>{profile.relation}</Text>
            </View>
            {profiles.length > 1 ? (
              <Pressable onPress={() => handleDeleteProfile(profile.id)} hitSlop={8}>
                <MaterialIcons name="delete-outline" size={20} color={C.textTertiary} />
              </Pressable>
            ) : null}
          </Pressable>
        ))}

        {showAdd ? (
          <View style={[s.addForm, { backgroundColor: C.card, borderColor: C.primary }]}>
            <Text style={[s.addFormTitle, { color: C.textPrimary }]}>Add New Profile</Text>

            <Text style={[s.formLabel, { color: C.textSecondary }]}>Avatar</Text>
            <View style={s.avatarRow}>
              {PROFILE_AVATARS.map((a, i) => (
                <Pressable key={i} onPress={() => setSelectedAvatar(i)}
                  style={[s.avatarBtn, { borderColor: selectedAvatar === i ? PROFILE_COLORS[selectedColor] : C.border }]}>
                  <Text style={{ fontSize: 22 }}>{a}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[s.formLabel, { color: C.textSecondary }]}>Color</Text>
            <View style={s.colorRow}>
              {PROFILE_COLORS.map((c, i) => (
                <Pressable key={i} onPress={() => setSelectedColor(i)}
                  style={[s.colorDot, { backgroundColor: c }, selectedColor === i && s.colorSelected]}>
                  {selectedColor === i ? <MaterialIcons name="check" size={12} color="#fff" /> : null}
                </Pressable>
              ))}
            </View>

            <Text style={[s.formLabel, { color: C.textSecondary }]}>Name</Text>
            <TextInput
              style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.textPrimary }]}
              value={name} onChangeText={setName}
              placeholder="Full name" placeholderTextColor={C.textTertiary}
            />

            <Text style={[s.formLabel, { color: C.textSecondary }]}>Relation</Text>
            <View style={s.relationRow}>
              {['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Other'].map(r => (
                <Pressable key={r} onPress={() => setRelation(r)}
                  style={[s.relationBtn, { borderColor: relation === r ? C.primary : C.border, backgroundColor: relation === r ? C.primaryDim : 'transparent' }]}>
                  <Text style={[s.relationText, { color: relation === r ? C.primary : C.textSecondary }]}>{r}</Text>
                </Pressable>
              ))}
            </View>

            <View style={s.formBtns}>
              <Pressable style={[s.cancelBtn, { borderColor: C.border }]} onPress={() => setShowAdd(false)}>
                <Text style={[s.cancelBtnText, { color: C.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[s.submitBtn, { backgroundColor: PROFILE_COLORS[selectedColor], opacity: name.trim() ? 1 : 0.5 }]}
                onPress={handleAddProfile}
                disabled={!name.trim() || loading}
              >
                <Text style={s.submitBtnText}>{loading ? 'Adding...' : 'Add Profile'}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={[s.addNewBtn, { borderColor: C.primary }]} onPress={() => setShowAdd(true)}>
            <MaterialIcons name="person-add" size={20} color={C.primary} />
            <Text style={[s.addNewBtnText, { color: C.primary }]}>Add Family Member</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: FontSize.sm, marginBottom: Spacing.lg, lineHeight: 20 },
  content: { paddingHorizontal: Spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5, marginBottom: Spacing.md },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profileName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  profileRelation: { fontSize: FontSize.sm, marginTop: 2 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  activeBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  addForm: { borderRadius: BorderRadius.lg, borderWidth: 1.5, padding: Spacing.lg, marginBottom: Spacing.md },
  addFormTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  formLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  colorDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { transform: [{ scale: 1.2 }] },
  input: { borderWidth: 1.5, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.base, marginBottom: Spacing.md },
  relationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  relationBtn: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  relationText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  formBtns: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: BorderRadius.full, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  submitBtn: { flex: 1, borderRadius: BorderRadius.full, paddingVertical: 12, alignItems: 'center' },
  submitBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
  addNewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: BorderRadius.lg, paddingVertical: Spacing.xl },
  addNewBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});
