import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Workout = {
  id: string;
  name: string;
  duration: number; // minutes
  calories: number;
  date: string; // ISO date (YYYY-MM-DD)
};

export type WorkoutInput = Omit<Workout, 'id'>;

const normalizeDate = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
};

type WorkoutState = {
  workouts: Workout[];
  addWorkout: (input: WorkoutInput) => void;
  updateWorkout: (id: string, updates: Partial<WorkoutInput>) => void;
  deleteWorkout: (id: string) => void;
  reset: () => void;
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useWorkoutsStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      addWorkout: (input) => {
        const nextWorkout: Workout = { ...input, id: createId(), date: normalizeDate(input.date) };
        set({ workouts: [nextWorkout, ...get().workouts] });
      },
      updateWorkout: (id, updates) => {
        set({
          workouts: get().workouts.map((workout) =>
            workout.id === id ? { ...workout, ...updates, date: updates.date ? normalizeDate(updates.date) : workout.date } : workout,
          ),
        });
      },
      deleteWorkout: (id) => set({ workouts: get().workouts.filter((workout) => workout.id !== id) }),
      reset: () => set({ workouts: [] }),
    }),
    {
      name: 'fitness-workouts',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useWorkouts = () =>
  useWorkoutsStore((state) => ({
    workouts: state.workouts,
    addWorkout: state.addWorkout,
    updateWorkout: state.updateWorkout,
    deleteWorkout: state.deleteWorkout,
  }));
