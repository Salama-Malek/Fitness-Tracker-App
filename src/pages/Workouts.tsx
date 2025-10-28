import { memo, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

import { Header } from '../components/Header';
import { WorkoutCard } from '../components/WorkoutCard';
import { AddWorkoutModal } from '../components/AddWorkoutModal';
import { WorkoutInput, Workout, useWorkouts } from '../store/useWorkouts';
import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WorkoutsComponent = () => {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const isRTL = useLanguageStore((state) => state.isRTL);
  const [visible, setVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const sortedWorkouts = useMemo(
    () =>
      [...workouts].sort((a, b) => {
        if (a.date === b.date) {
          return b.calories - a.calories;
        }
        return a.date < b.date ? 1 : -1;
      }),
    [workouts],
  );

  const openModal = (workout?: Workout) => {
    setSelectedWorkout(workout ?? null);
    setVisible(true);
  };

  const closeModal = () => setVisible(false);

  const handleSubmit = (payload: WorkoutInput, workoutId?: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (workoutId) {
      updateWorkout(workoutId, payload);
    } else {
      addWorkout(payload);
    }
  };

  const handleDelete = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    deleteWorkout(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title={t('workouts.title')} />
      {sortedWorkouts.length ? (
        <FlatList
          data={sortedWorkouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} onEdit={openModal} onDelete={handleDelete} />
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text
            style={{
              color: theme.colors.muted,
              fontFamily: theme.fonts.regular,
              textAlign: 'center',
            }}
          >
            {t('workouts.noWorkouts')}
          </Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => openModal()}
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.accent,
            right: isRTL ? undefined : 20,
            left: isRTL ? 20 : undefined,
          },
        ]}
      >
        <MaterialIcons name="add" size={28} color={theme.colors.background} />
      </Pressable>

      <AddWorkoutModal
        visible={visible}
        onDismiss={closeModal}
        onSubmit={handleSubmit}
        workout={selectedWorkout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

export const Workouts = memo(WorkoutsComponent);
