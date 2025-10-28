import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n, { type SupportedLanguage } from '../i18n';

const rtlLanguages: SupportedLanguage[] = ['ar'];

const applyRTL = (rtl: boolean) => {
  if (I18nManager.isRTL === rtl) {
    return;
  }
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
};

type LanguageState = {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      isRTL: false,
      setLanguage: async (language) => {
        const rtl = rtlLanguages.includes(language);
        await i18n.changeLanguage(language);
        applyRTL(rtl);
        set({ language, isRTL: rtl });
      },
    }),
    {
      name: 'fitness-language',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        const language = state?.language ?? 'en';
        const rtl = rtlLanguages.includes(language);
        void i18n.changeLanguage(language);
        applyRTL(rtl);
      },
    },
  ),
);

export const useLanguage = () =>
  useLanguageStore((state) => ({
    language: state.language,
    isRTL: state.isRTL,
    setLanguage: state.setLanguage,
  }));
