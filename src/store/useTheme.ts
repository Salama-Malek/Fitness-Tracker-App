import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getTheme, type AppTheme, type ThemeMode } from '../styles/theme';
import { useLanguageStore } from './useLanguage';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
      toggleTheme: () => set({ mode: get().mode === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'fitness-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useThemeMode = () => useThemeStore((state) => state.mode);

export const useAppTheme = (): AppTheme => {
  const mode = useThemeMode();
  const language = useLanguageStore((state) => state.language);
  return useMemo(() => {
    const base = getTheme(mode);
    const isArabic = language === 'ar';
    const isRussian = language === 'ru';
    const localizedFont = isArabic ? base.fonts.arabic : isRussian ? base.fonts.russian : base.fonts.regular;
    const localizedMedium = isArabic ? base.fonts.arabic : isRussian ? base.fonts.russian : base.fonts.medium;
    const localizedBold = isArabic ? base.fonts.arabic : isRussian ? base.fonts.russian : base.fonts.bold;

    return {
      ...base,
      fonts: {
        ...base.fonts,
        regular: localizedFont,
        medium: localizedMedium,
        bold: localizedBold,
      },
    };
  }, [language, mode]);
};
