import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../store/useTheme';
import { useLanguage } from '../store/useLanguage';
import type { SupportedLanguage } from '../i18n';

const options: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
];

const LanguageSwitcherComponent = () => {
  const theme = useAppTheme();
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.muted,
            fontFamily: theme.fonts.regular,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      >
        {t('settings.languageLabel')}
      </Text>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        {options.map(({ code, label }) => {
          const active = language === code;
          return (
            <Pressable
              key={code}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => void setLanguage(code)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.accent : 'transparent',
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? theme.colors.background : theme.colors.text,
                    fontFamily: theme.fonts.medium,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  label: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
  },
});

export const LanguageSwitcher = memo(LanguageSwitcherComponent);
