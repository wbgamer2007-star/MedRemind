// Powered by OnSpace.AI
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageSet } from '../services/storage';
import { STORAGE_KEYS, PROFILE_COLORS, PROFILE_AVATARS } from '../constants/config';
import { saveProfile, generateId } from '../services/medicineService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { requestNotificationPermissions } from '../services/notificationService';

const { width, height } = Dimensions.get('window');
const C = Colors.dark;

const SLIDES = [
  {
    image: require('../assets/images/onboard1.png'),
    title: 'Never Miss a Dose',
    subtitle: 'Smart reminders with sound, vibration & visual alerts ensure you always take your medication on time.',
  },
  {
    image: require('../assets/images/onboard2.png'),
    title: 'Your Daily Schedule',
    subtitle: 'Beautiful timeline view shows all your medicines for the day. Track history on an interactive calendar.',
  },
  {
    image: require('../assets/images/onboard3.png'),
    title: 'Adherence Insights',
    subtitle: 'Visual analytics show your medication consistency, streaks, and trends so you stay on top of your health.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Self');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);

  const setupOpacity = useSharedValue(0);
  const setupTranslate = useSharedValue(40);
  const setupStyle = useAnimatedStyle(() => ({
    opacity: setupOpacity.value,
    transform: [{ translateY: setupTranslate.value }],
  }));

  function handleNext() {
    if (currentPage < SLIDES.length - 1) {
      const next = currentPage + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentPage(next);
    } else {
      setShowSetup(true);
      setupOpacity.value = withTiming(1, { duration: 400 });
      setupTranslate.value = withSpring(0, { damping: 20 });
    }
  }

  async function handleFinish() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await requestNotificationPermissions();
      const profile = {
        id: generateId(),
        name: name.trim(),
        avatar: PROFILE_AVATARS[selectedAvatar],
        color: PROFILE_COLORS[selectedColor],
        relation,
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
      await saveProfile(profile);
      await storageSet(STORAGE_KEYS.ACTIVE_PROFILE, profile.id);
      await storageSet(STORAGE_KEYS.ONBOARDING_DONE, true);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  if (showSetup) {
    return (
      <KeyboardAvoidingView
        style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[s.setupContainer, setupStyle]}>
          <Text style={s.setupTitle}>Create Your Profile</Text>
          <Text style={s.setupSubtitle}>Personalize your medicine tracking experience</Text>

          <Text style={s.sectionLabel}>Choose Avatar</Text>
          <View style={s.avatarRow}>
            {PROFILE_AVATARS.map((a, i) => (
              <Pressable key={i} onPress={() => setSelectedAvatar(i)}
                style={[s.avatarBtn, selectedAvatar === i && { borderColor: PROFILE_COLORS[selectedColor], borderWidth: 2.5 }]}>
                <Text style={{ fontSize: 24 }}>{a}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.sectionLabel}>Profile Color</Text>
          <View style={s.colorRow}>
            {PROFILE_COLORS.map((c, i) => (
              <Pressable key={i} onPress={() => setSelectedColor(i)}
                style={[s.colorDot, { backgroundColor: c }, selectedColor === i && s.colorDotSelected]}>
                {selectedColor === i ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
              </Pressable>
            ))}
          </View>

          <Text style={s.sectionLabel}>Your Name</Text>
          <TextInput
            style={s.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={C.textTertiary}
            autoFocus
          />

          <Text style={s.sectionLabel}>Relation</Text>
          <View style={s.relationRow}>
            {['Self', 'Spouse', 'Parent', 'Child', 'Other'].map(r => (
              <Pressable key={r} onPress={() => setRelation(r)}
                style={[s.relationBtn, relation === r && { backgroundColor: PROFILE_COLORS[selectedColor], borderColor: PROFILE_COLORS[selectedColor] }]}>
                <Text style={[s.relationText, relation === r && { color: '#fff' }]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[s.finishBtn, { backgroundColor: PROFILE_COLORS[selectedColor], opacity: name.trim() ? 1 : 0.5 }]}
            onPress={handleFinish}
            disabled={!name.trim() || loading}
          >
            <Text style={s.finishBtnText}>{loading ? 'Setting up...' : 'Get Started'}</Text>
            {!loading ? <MaterialIcons name="arrow-forward" size={20} color="#fff" /> : null}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[s.slide, { width }]}>
            <Image source={slide.image} style={s.slideImage} contentFit="cover" />
            <View style={s.slideOverlay} />
            <View style={s.slideContent}>
              <Text style={s.slideTitle}>{slide.title}</Text>
              <Text style={s.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={s.footer}>
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === currentPage && s.dotActive]} />
          ))}
        </View>
        <Pressable style={s.nextBtn} onPress={handleNext}>
          <Text style={s.nextBtnText}>{currentPage === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  slide: { height: '100%' },
  slideImage: { position: 'absolute', width: '100%', height: '65%', top: 0 },
  slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', backgroundColor: C.background, opacity: 0.95 },
  slideContent: { position: 'absolute', bottom: 120, left: Spacing.xl, right: Spacing.xl },
  slideTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: C.textPrimary, marginBottom: Spacing.sm },
  slideSubtitle: { fontSize: FontSize.base, color: C.textSecondary, lineHeight: 24 },
  footer: { position: 'absolute', bottom: 32, left: 0, right: 0, paddingHorizontal: Spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.textTertiary },
  dotActive: { width: 24, backgroundColor: C.primary },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: Spacing.lg, paddingVertical: 14, borderRadius: BorderRadius.full },
  nextBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },

  setupContainer: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  setupTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: C.textPrimary, marginBottom: Spacing.xs },
  setupSubtitle: { fontSize: FontSize.base, color: C.textSecondary, marginBottom: Spacing.xl },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.lg },
  avatarBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.border },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.lg },
  colorDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { transform: [{ scale: 1.15 }] },
  nameInput: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: FontSize.base, color: C.textPrimary, marginBottom: Spacing.lg },
  relationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.xl },
  relationBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  relationText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.textSecondary },
  finishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: BorderRadius.full },
  finishBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
