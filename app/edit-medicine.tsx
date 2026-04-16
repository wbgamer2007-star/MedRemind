// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../hooks/useApp';
import { useAlert } from '@/template';
import { Input, Button, MedicineCard } from '../components';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { MEDICINE_TYPES, FREQUENCY_OPTIONS, MEAL_TIMING, DAYS_OF_WEEK, PROFILE_COLORS } from '../constants/config';
import { Medicine } from '../services/medicineService';

export default function EditMedicineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { settings, medicines, updateMedicine, removeMedicine } = useApp();
  const { showAlert } = useAlert();
  const C = settings.darkMode ? Colors.dark : Colors.light;

  const medicine = medicines.find(m => m.id === id);

  const [name, setName] = useState(medicine?.name || '');
  const [dosage, setDosage] = useState(medicine?.dosage || '');
  const [selectedType, setSelectedType] = useState(medicine?.type || 'tablet');
  const [frequency, setFrequency] = useState(medicine?.frequency || 'daily');
  const [customDays, setCustomDays] = useState<number[]>(medicine?.customDays || []);
  const [times, setTimes] = useState(medicine?.times || ['08:00']);
  const [mealTiming, setMealTiming] = useState(medicine?.mealTiming || 'after_meal');
  const [startDate, setStartDate] = useState(medicine?.startDate || '');
  const [endDate, setEndDate] = useState(medicine?.endDate || '');
  const [instructions, setInstructions] = useState(medicine?.instructions || '');
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS.indexOf(medicine?.color || '#00D4AA'));
  const [isActive, setIsActive] = useState(medicine?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  if (!medicine) {
    return (
      <View style={[s.root, { backgroundColor: C.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: C.textSecondary }}>Medicine not found</Text>
        <Pressable onPress={() => router.back()}><Text style={{ color: C.primary }}>Go Back</Text></Pressable>
      </View>
    );
  }

  function toggleDay(dayId: number) {
    setCustomDays(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]);
  }

  async function handleSave() {
    if (!name.trim() || !dosage.trim()) {
      showAlert('Missing Info', 'Please fill in medicine name and dosage.');
      return;
    }
    setLoading(true);
    try {
      await updateMedicine({
        ...medicine,
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
        color: PROFILE_COLORS[selectedColor] || medicine.color,
        isActive,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    showAlert('Delete Medicine', `Are you sure you want to delete "${medicine.name}"? All history for this medicine will be preserved.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await removeMedicine(id); router.back(); } },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={s.closeBtn} hitSlop={8}>
          <MaterialIcons name="close" size={24} color={C.textSecondary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>Edit Medicine</Text>
        <Pressable onPress={handleSave} style={[s.saveBtn, { backgroundColor: C.primary, opacity: loading ? 0.6 : 1 }]} disabled={loading}>
          <Text style={s.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Active Toggle */}
        <View style={[s.activeRow, { backgroundColor: C.card, borderColor: C.borderLight }]}>
          <View>
            <Text style={[s.activeTitle, { color: C.textPrimary }]}>Active Reminder</Text>
            <Text style={[s.activeDesc, { color: C.textSecondary }]}>Enable or pause notifications for this medicine</Text>
          </View>
          <Pressable onPress={() => setIsActive(!isActive)}
            style={[s.toggle, { backgroundColor: isActive ? C.primaryDim : C.surface, borderColor: isActive ? C.primaryMid : C.border }]}>
            <View style={[s.toggleDot, { backgroundColor: isActive ? C.primary : C.textTertiary, marginLeft: isActive ? 20 : 2 }]} />
          </Pressable>
        </View>

        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Basic Information</Text>
        <Input label="Medicine Name" value={name} onChangeText={setName} placeholder="e.g. Metformin" dark={settings.darkMode} />
        <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 500mg, 2 tablets" dark={settings.darkMode} />

        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
          {MEDICINE_TYPES.map(type => (
            <Pressable key={type.id}
              style={[s.typeChip, { borderColor: selectedType === type.id ? type.color : C.border, backgroundColor: selectedType === type.id ? type.color + '20' : C.card }]}
              onPress={() => setSelectedType(type.id)}
            >
              <MaterialIcons name={type.icon as any} size={16} color={selectedType === type.id ? type.color : C.textSecondary} />
              <Text style={[s.typeLabel, { color: selectedType === type.id ? type.color : C.textSecondary }]}>{type.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Color</Text>
        <View style={s.colorRow}>
          {PROFILE_COLORS.map((c, i) => (
            <Pressable key={i} onPress={() => setSelectedColor(i)}
              style={[s.colorDot, { backgroundColor: c }, selectedColor === i && s.colorDotSelected]}>
              {selectedColor === i ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
            </Pressable>
          ))}
        </View>

        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Frequency</Text>
        <View style={s.freqGrid}>
          {FREQUENCY_OPTIONS.map(f => (
            <Pressable key={f.id}
              style={[s.freqChip, { borderColor: frequency === f.id ? C.primary : C.border, backgroundColor: frequency === f.id ? C.primaryDim : C.card }]}
              onPress={() => setFrequency(f.id)}
            >
              <Text style={[s.freqLabel, { color: frequency === f.id ? C.primary : C.textPrimary }]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>

        {(frequency === 'custom' || frequency === 'weekly') ? (
          <>
            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Days</Text>
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

        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Times</Text>
        {times.map((t, i) => (
          <View key={i} style={s.timeRow}>
            <Input value={t} onChangeText={v => { const n = [...times]; n[i] = v; setTimes(n); }} dark={settings.darkMode} containerStyle={{ flex: 1, marginBottom: 0 }} keyboardType="numbers-and-punctuation" />
            {times.length > 1 ? (
              <Pressable onPress={() => setTimes(prev => prev.filter((_, idx) => idx !== i))} hitSlop={8}>
                <MaterialIcons name="remove-circle" size={22} color={C.error} />
              </Pressable>
            ) : null}
          </View>
        ))}
        {times.length < 6 ? (
          <Pressable onPress={() => setTimes(prev => [...prev, '12:00'])} style={[s.addTimeBtn, { borderColor: C.primary }]}>
            <MaterialIcons name="add" size={16} color={C.primary} />
            <Text style={[s.addTimeBtnText, { color: C.primary }]}>Add Time</Text>
          </Pressable>
        ) : null}

        <Text style={[s.sectionLabel, { color: C.textSecondary }]}>When to Take</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
          {MEAL_TIMING.map(m => (
            <Pressable key={m.id}
              style={[s.typeChip, { borderColor: mealTiming === m.id ? C.primary : C.border, backgroundColor: mealTiming === m.id ? C.primaryDim : C.card }]}
              onPress={() => setMealTiming(m.id)}
            >
              <Text style={[s.typeLabel, { color: mealTiming === m.id ? C.primary : C.textSecondary }]}>{m.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.datesRow}>
          <Input label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" dark={settings.darkMode} containerStyle={{ flex: 1 }} />
          <Input label="End Date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" dark={settings.darkMode} containerStyle={{ flex: 1 }} />
        </View>

        <Input label="Special Instructions" value={instructions} onChangeText={setInstructions} placeholder="Optional notes..." multiline numberOfLines={3} dark={settings.darkMode} style={{ minHeight: 70 }} />

        <Button label={loading ? 'Saving...' : 'Save Changes'} onPress={handleSave} loading={loading} dark={settings.darkMode} style={{ marginBottom: Spacing.md }} />
        <Button label="Delete Medicine" onPress={handleDelete} variant="danger" dark={settings.darkMode} />
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
  activeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  activeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  activeDesc: { fontSize: FontSize.sm, marginTop: 2 },
  toggle: { width: 46, height: 26, borderRadius: 13, borderWidth: 1, justifyContent: 'center' },
  toggleDot: { width: 20, height: 20, borderRadius: 10 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.md },
  colorDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { transform: [{ scale: 1.2 }] },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  freqChip: { borderWidth: 1.5, borderRadius: BorderRadius.md, padding: Spacing.md, minWidth: '47%' },
  freqLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  daysRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: Spacing.md },
  dayBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  dayLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  addTimeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.full, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', marginBottom: Spacing.md },
  addTimeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  datesRow: { flexDirection: 'row', gap: Spacing.sm },
});
