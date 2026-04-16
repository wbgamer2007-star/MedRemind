// Powered by OnSpace.AI
export const MEDICINE_TYPES = [
  { id: 'tablet', label: 'Tablet', icon: 'pill', color: '#00D4AA' },
  { id: 'capsule', label: 'Capsule', icon: 'pill', color: '#B39DDB' },
  { id: 'syrup', label: 'Syrup', icon: 'local-drink', color: '#FFB347' },
  { id: 'injection', label: 'Injection', icon: 'colorize', color: '#FF6B6B' },
  { id: 'drops', label: 'Drops', icon: 'opacity', color: '#64B5F6' },
  { id: 'inhaler', label: 'Inhaler', icon: 'air', color: '#81C784' },
  { id: 'cream', label: 'Cream/Gel', icon: 'spa', color: '#F48FB1' },
  { id: 'patch', label: 'Patch', icon: 'healing', color: '#A5D6A7' },
];

export const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Every Day', description: 'Take every day' },
  { id: 'twice_daily', label: 'Twice Daily', description: 'Morning & Evening' },
  { id: 'thrice_daily', label: 'Three Times Daily', description: 'Morning, Afternoon & Night' },
  { id: 'weekly', label: 'Weekly', description: 'Once per week' },
  { id: 'custom', label: 'Custom', description: 'Choose specific days' },
  { id: 'as_needed', label: 'As Needed', description: 'Only when required' },
];

export const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
];

export const MEAL_TIMING = [
  { id: 'before_meal', label: 'Before Meal', icon: 'restaurant' },
  { id: 'with_meal', label: 'With Meal', icon: 'set-meal' },
  { id: 'after_meal', label: 'After Meal', icon: 'dinner-dining' },
  { id: 'empty_stomach', label: 'Empty Stomach', icon: 'free-breakfast' },
  { id: 'anytime', label: 'Anytime', icon: 'schedule' },
];

export const PROFILE_COLORS = [
  '#00D4AA', '#FF6B6B', '#FFB347', '#B39DDB',
  '#64B5F6', '#81C784', '#F48FB1', '#FFCC02',
];

export const PROFILE_AVATARS = ['👤', '👨', '👩', '👴', '👵', '👦', '👧', '🧑'];

export const STORAGE_KEYS = {
  PROFILES: 'medremind_profiles',
  ACTIVE_PROFILE: 'medremind_active_profile',
  MEDICINES: 'medremind_medicines',
  DOSE_LOGS: 'medremind_dose_logs',
  SETTINGS: 'medremind_settings',
  ONBOARDING_DONE: 'medremind_onboarding',
};
