import { memo, useMemo } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { Workout } from '../store/useWorkouts';
import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

type WorkoutCardProps = {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
};

const DURATION_LEVELS = {
  short: { min: 0, max: 30 },
  medium: { min: 30, max: 60 },
  long: { min: 60, max: Infinity },
} as const;

const getDurationCategory = (duration: number) => {
  if (duration < DURATION_LEVELS.medium.min) return 'short';
  if (duration < DURATION_LEVELS.long.min) return 'medium';
  return 'long';
};

const formatDate = (value: string, locale: string) => {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return value;
  }
};

const WorkoutCardComponent = ({ workout, onEdit, onDelete }: WorkoutCardProps) => {
  const theme = useAppTheme();
  const { i18n, t } = useTranslation();
  const isRTL = useLanguageStore((state) => state.isRTL);

  const durationCategory = useMemo(() => getDurationCategory(workout.duration), [workout.duration]);

  const indicatorColor = useMemo(() => {
    switch (durationCategory) {
      case 'short':
        return '#4ade80';
      case 'medium':
        return '#facc15';
      default:
        return '#f97316';
    }
  }, [durationCategory]);

  const handleDelete = () => {
    Alert.alert(t('common.confirmDelete'), t('common.confirmDeleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(workout.id) },
    ]);
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      exiting={FadeOutDown.duration(150)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: theme.colors.border }}
        onPress={() => onEdit(workout)}
        onLongPress={handleDelete}
        style={[
          styles.inner,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={[styles.accent, { backgroundColor: indicatorColor }]} />
        <View style={[styles.content, isRTL && styles.contentRTL]}>
          <Text
            style={[
              styles.name,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts.medium,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            numberOfLines={2}
          >
            {workout.name}
          </Text>
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <Text
              style={[
                styles.meta,
                { color: theme.colors.muted, fontFamily: theme.fonts.regular },
              ]}
            >
              {formatDate(workout.date, i18n.language)}
            </Text>
            <Text
              style={[
                styles.meta,
                { color: theme.colors.muted, fontFamily: theme.fonts.regular },
              ]}
            >
              • {t(`workouts.duration${capitalize(durationCategory)}`)}
            </Text>
          </View>
          <View style={[styles.statsRow, isRTL && styles.metaRowRTL]}>
            <Text
              style={[
                styles.statText,
                { color: theme.colors.text, fontFamily: theme.fonts.medium },
              ]}
            >
              {`${workout.duration} min`}
            </Text>
            <Text
              style={[
                styles.statText,
                { color: theme.colors.text, fontFamily: theme.fonts.medium },
              ]}
            >
              {`${workout.calories} kcal`}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inner: {
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  accent: {
    width: 6,
    borderRadius: 3,
    height: '85%',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  contentRTL: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaRowRTL: {
    flexDirection: 'row-reverse',
  },
  meta: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 15,
  },
});

export const WorkoutCard = memo(WorkoutCardComponent);
