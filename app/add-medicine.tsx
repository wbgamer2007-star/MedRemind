// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../hooks/useApp';
import { Input, Button } from '../components';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { MEDICINE_TYPES, FREQUENCY_OPTIONS, MEAL_TIMING, DAYS_OF_WEEK, PROFILE_COLORS } from '../constants/config';
import { todayString } from '../services/medicineService';
import { scheduleMedicineNotification, requestNotificationPermissions } from '../services/notificationService';

export default function AddMedicineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, activeProfile, addMedicine } = useApp();
  const C = settings.darkMode ? Colors.dark : Colors.light;

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedType, setSelectedType] = useState('tablet');
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [times, setTimes] = useState(['08:00']);
  const [mealTiming, setMealTiming] = useState('after_meal');
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);

  function toggleDay(dayId: number) {
    setCustomDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  }

  function addTime() {
    if (times.length >= 6) return;
    setTimes(prev => [...prev, '12:00']);
  }

  function removeTime(idx: number) {
    if (times.length <= 1) return;
    setTimes(prev => prev.filter((_, i) => i !== idx));
  }

  function updateTime(idx: number, value: string) {
    setTimes(prev => { const n = [...prev]; n[idx] = value; return n; });
  }

  async function handleSave() {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Missing Info', 'Please fill in medicine name and dosage.');
      return;
    }
    if (!activeProfile) return;
    setLoading(true);
    try {
      const medicine = await addMedicine({
        profileId: activeProfile.id,
        name: name.trim(),
        dosage: dosage.trim(),
        type: selectedType,
        frequency,
        customDays: frequency === 'custom' || frequency === 'weekly' ? customDays : undefined,
        times,
        mealTiming,
        startDate,
        endDate: endDate || undefined,
        instructions: instructions.trim() || undefined,
        color: PROFILE_COLORS[selectedColor],
        isActive: true,
      });

      if (settings.notificationsEnabled) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          const notifIds: string[] = [];
          for (const time of times) {
            const ids = await scheduleMedicineNotification(medicine, time, activeProfile.name);
            notifIds.push(...ids);
          }
        }
      }
      router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={s.closeBtn} hitSlop={8}>
          <MaterialIcons name="close" size={24} color={C.textSecondary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>Add Medicine</Text>
        <Pressable
          onPress={handleSave}
          style={[s.saveBtn, { backgroundColor: C.primary, opacity: loading ? 0.6 : 1 }]}
          disabled={loading}
        >
          <Text style={s.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Basic Info */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Basic Information</Text>
        <Input label="Medicine Name" value={name} onChangeText={setName} placeholder="e.g. Metformin" dark={settings.darkMode} />
        <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 500mg, 2 tablets" dark={settings.darkMode} />

        {/* Medicine Type */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
          {MEDICINE_TYPES.map(type => (
            <Pressable
              key={type.id}
              style={[s.typeChip, { borderColor: selectedType === type.id ? type.color : C.border, backgroundColor: selectedType === type.id ? type.color + '20' : C.card }]}
              onPress={() => setSelectedType(type.id)}
            >
              <MaterialIcons name={type.icon as any} size={16} color={selectedType === type.id ? type.color : C.textSecondary} />
              <Text style={[s.typeLabel, { color: selectedType === type.id ? type.color : C.textSecondary }]}>{type.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Color */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Color</Text>
        <View style={s.colorRow}>
          {PROFILE_COLORS.map((c, i) => (
            <Pressable key={i} onPress={() => setSelectedColor(i)}
              style={[s.colorDot, { backgroundColor: c }, selectedColor === i && s.colorDotSelected]}>
              {selectedColor === i ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
            </Pressable>
          ))}
        </View>

        {/* Frequency */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Frequency</Text>
        <View style={s.freqGrid}>
          {FREQUENCY_OPTIONS.map(f => (
            <Pressable key={f.id}
              style={[s.freqChip, { borderColor: frequency === f.id ? C.primary : C.border, backgroundColor: frequency === f.id ? C.primaryDim : C.card }]}
              onPress={() => setFrequency(f.id)}
            >
              <Text style={[s.freqLabel, { color: frequency === f.id ? C.primary : C.textPrimary }]}>{f.label}</Text>
              <Text style={[s.freqDesc, { color: frequency === f.id ? C.primary + 'B0' : C.textTertiary }]}>{f.description}</Text>
            </Pressable>
          ))}
        </View>

        {/* Custom Days */}
        {(frequency === 'custom' || frequency === 'weekly') ? (
          <>
            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Days of Week</Text>
            <View style={s.daysRow}>
              {DAYS_OF_WEEK.map(d => (
                <Pressable key={d.id}
                  style={[s.dayBtn, { borderColor: customDays.includes(d.id) ? C.primary : C.border, backgroundColor: customDays.includes(d.id) ? C.primary : C.card }]}
                  onPress={() => toggleDay(d.id)}
                >
                  <Text style={[s.dayLabel, { color: customDays.includes(d.id) ? '#fff' : C.textSecondary }]}>{d.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {/* Times */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Reminder Times</Text>
        {times.map((t, i) => (
          <View key={i} style={s.timeRow}>
            <Input
              value={t}
              onChangeText={v => updateTime(i, v)}
              placeholder="HH:MM"
              dark={settings.darkMode}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              keyboardType="numbers-and-punctuation"
            />
            {times.length > 1 ? (
              <Pressable onPress={() => removeTime(i)} style={s.removeTimeBtn} hitSlop={8}>
                <MaterialIcons name="remove-circle" size={22} color={C.error} />
              </Pressable>
            ) : null}
          </View>
        ))}
        <Pressable onPress={addTime} style={[s.addTimeBtn, { borderColor: C.primary }]}>
          <MaterialIcons name="add" size={16} color={C.primary} />
          <Text style={[s.addTimeBtnText, { color: C.primary }]}>Add Another Time</Text>
        </Pressable>

        {/* Meal Timing */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>When to Take</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
          {MEAL_TIMING.map(m => (
            <Pressable key={m.id}
              style={[s.typeChip, { borderColor: mealTiming === m.id ? C.primary : C.border, backgroundColor: mealTiming === m.id ? C.primaryDim : C.card }]}
              onPress={() => setMealTiming(m.id)}
            >
              <MaterialIcons name={m.icon as any} size={16} color={mealTiming === m.id ? C.primary : C.textSecondary} />
              <Text style={[s.typeLabel, { color: mealTiming === m.id ? C.primary : C.textSecondary }]}>{m.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Dates */}
        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Duration</Text>
        <View style={s.datesRow}>
          <Input label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" dark={settings.darkMode} containerStyle={{ flex: 1 }} />
          <Input label="End Date (optional)" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" dark={settings.darkMode} containerStyle={{ flex: 1 }} />
        </View>

        {/* Instructions */}
        <Input
          label="Special Instructions (optional)"
          value={instructions}
          onChangeText={setInstructions}
          placeholder="e.g. Take with plenty of water"
          multiline numberOfLines={3}
          dark={settings.darkMode}
          style={{ minHeight: 70 }}
        />

        <Button label={loading ? 'Saving...' : 'Save Medicine'} onPress={handleSave} loading={loading} dark={settings.darkMode} style={{ marginTop: Spacing.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#21262D' },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  saveBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
  content: { padding: Spacing.lg },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.md },
  colorDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { transform: [{ scale: 1.2 }] },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  freqChip: { borderWidth: 1.5, borderRadius: BorderRadius.md, padding: Spacing.md, minWidth: '47%' },
  freqLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: 2 },
  freqDesc: { fontSize: FontSize.xs },
  daysRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: Spacing.md },
  dayBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  dayLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  removeTimeBtn: { padding: 4 },
  addTimeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.full, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', marginBottom: Spacing.md },
  addTimeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  datesRow: { flexDirection: 'row', gap: Spacing.sm },
});
