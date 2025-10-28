import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { Workout, WorkoutInput } from '../store/useWorkouts';
import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

type AddWorkoutModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (input: WorkoutInput, workoutId?: string) => void;
  workout?: Workout | null;
};

type FormState = {
  name: string;
  duration: string;
  calories: string;
  date: Date;
};

const createInitialState = (workout?: Workout | null): FormState => ({
  name: workout?.name ?? '',
  duration: workout ? String(workout.duration) : '',
  calories: workout ? String(workout.calories) : '',
  date: workout ? new Date(workout.date) : new Date(),
});

export const AddWorkoutModal = ({ visible, onDismiss, onSubmit, workout }: AddWorkoutModalProps) => {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const isRTL = useLanguageStore((state) => state.isRTL);
  const [form, setForm] = useState<FormState>(() => createInitialState(workout));
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(createInitialState(workout));
    } else {
      setShowIOSPicker(false);
    }
  }, [visible, workout]);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(form.date);
    } catch {
      return form.date.toISOString().split('T')[0];
    }
  }, [form.date, i18n.language]);

  const handleChange = (field: keyof FormState, value: string | Date) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      handleChange('date', selectedDate);
    }
    if (Platform.OS === 'android') {
      setTimeout(() => setShowIOSPicker(false), 0);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: form.date,
        onChange: handleDateChange,
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  const normalizedInput = (): WorkoutInput | null => {
    const name = form.name.trim();
    const duration = Number(form.duration);
    const calories = Number(form.calories);

    if (!name || !form.duration || !form.calories) {
      Alert.alert(t('alerts.fillAllFields'));
      return null;
    }
    if (Number.isNaN(duration) || Number.isNaN(calories)) {
      Alert.alert(t('alerts.invalidNumber'));
      return null;
    }

    if (Number.isNaN(form.date.getTime())) {
      Alert.alert(t('alerts.invalidDate'));
      return null;
    }

    return {
      name,
      duration: Math.max(1, Math.round(duration)),
      calories: Math.max(1, Math.round(calories)),
      date: form.date.toISOString().split('T')[0],
    };
  };

  const handleSubmit = () => {
    const payload = normalizedInput();
    if (!payload) {
      return;
    }
    onSubmit(payload, workout?.id);
    onDismiss();
  };

  return (
    <Modal visible={visible} onRequestClose={onDismiss} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={styles.overlay} onPress={onDismiss} />
        <Animated.View
          entering={FadeInUp.duration(220)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts.medium,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {workout ? t('workouts.editWorkout') : t('workouts.addWorkout')}
          </Text>

          <View style={styles.fields}>
            <Field
              label={t('workouts.name')}
              placeholder={t('forms.namePlaceholder')}
              value={form.name}
              onChangeText={(value) => handleChange('name', value)}
              isRTL={isRTL}
              themeColors={{ text: theme.colors.text, border: theme.colors.border, background: theme.colors.background }}
              font={theme.fonts.regular}
            />
            <Field
              label={t('workouts.duration')}
              placeholder={t('forms.durationPlaceholder')}
              keyboardType="numeric"
              value={form.duration}
              onChangeText={(value) => handleChange('duration', value.replace(/[^0-9]/g, ''))}
              isRTL={isRTL}
              themeColors={{ text: theme.colors.text, border: theme.colors.border, background: theme.colors.background }}
              font={theme.fonts.regular}
            />
            <Field
              label={t('workouts.calories')}
              placeholder={t('forms.caloriesPlaceholder')}
              keyboardType="numeric"
              value={form.calories}
              onChangeText={(value) => handleChange('calories', value.replace(/[^0-9]/g, ''))}
              isRTL={isRTL}
              themeColors={{ text: theme.colors.text, border: theme.colors.border, background: theme.colors.background }}
              font={theme.fonts.regular}
            />
            <Pressable
              onPress={openDatePicker}
              style={[
                styles.datePicker,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Text
                style={[
                  styles.dateLabel,
                  {
                    color: theme.colors.muted,
                    fontFamily: theme.fonts.regular,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {t('workouts.date')}
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts.medium,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {formattedDate}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.buttons, isRTL && styles.buttonsRTL]}>
            <Pressable
              onPress={onDismiss}
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.secondaryText, { color: theme.colors.muted, fontFamily: theme.fonts.medium }]}>
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
            >
              <Text style={[styles.primaryText, { color: theme.colors.background, fontFamily: theme.fonts.medium }]}>
                {workout ? t('common.save') : t('common.add')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && showIOSPicker ? (
        <View style={styles.iosPicker}>
          <DateTimePicker mode="date" value={form.date} display="spinner" onChange={handleDateChange} />
        </View>
      ) : null}
    </Modal>
  );
};

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
  isRTL: boolean;
  themeColors: { text: string; border: string; background: string };
  font: string;
};

const Field = ({ label, placeholder, value, onChangeText, keyboardType = 'default', isRTL, themeColors, font }: FieldProps) => (
  <View style={styles.fieldWrapper}>
    <Text
      style={[
        styles.fieldLabel,
        {
          color: themeColors.text,
          fontFamily: font,
          textAlign: isRTL ? 'right' : 'left',
        },
      ]}
    >
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={themeColors.border}
      style={[
        styles.input,
        {
          color: themeColors.text,
          borderColor: themeColors.border,
          backgroundColor: themeColors.background,
          textAlign: isRTL ? 'right' : 'left',
          fontFamily: font,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  overlay: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 22,
  },
  fields: {
    gap: 16,
  },
  fieldWrapper: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
  },
  input: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  datePicker: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 13,
  },
  dateValue: {
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonsRTL: {
    flexDirection: 'row-reverse',
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 16,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
  },
  iosPicker: {
    backgroundColor: '#0f172a55',
  },
});
