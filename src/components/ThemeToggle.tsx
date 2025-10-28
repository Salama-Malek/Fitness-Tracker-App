import { memo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme, useThemeStore } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

const ThemeToggleComponent = () => {
  const theme = useAppTheme();
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isRTL = useLanguageStore((state) => state.isRTL);
  const { t } = useTranslation();

  const isDark = mode === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={styles.textGroup}>
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
          {t('settings.themeLabel')}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.muted,
              fontFamily: theme.fonts.regular,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {isDark ? t('common.dark') : t('common.light')}
        </Text>
      </View>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        thumbColor={isDark ? theme.colors.accent : theme.colors.surface}
        trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  textGroup: {
    gap: 4,
    flex: 1,
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
  },
});

export const ThemeToggle = memo(ThemeToggleComponent);
