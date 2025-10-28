import { memo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Header } from '../components/Header';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

const SettingsComponent = () => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const isRTL = useLanguageStore((state) => state.isRTL);
  const [aboutVisible, setAboutVisible] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title={t('settings.title')} />

      <View style={styles.section}>
        <LanguageSwitcher />
      </View>

      <View style={styles.section}>
        <ThemeToggle />
      </View>

      <Pressable
        onPress={() => setAboutVisible(true)}
        style={[
          styles.aboutCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 16 }}>
          {t('common.about')}
        </Text>
        <Text style={{ color: theme.colors.muted, fontFamily: theme.fonts.regular, flex: 1, textAlign: isRTL ? 'left' : 'right' }}>
          {t('settings.offlineNotice')}
        </Text>
      </Pressable>

      <Modal visible={aboutVisible} animationType="slide" transparent onRequestClose={() => setAboutVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 18, textAlign: isRTL ? 'right' : 'left' }}>
              {t('common.about')}
            </Text>
            <Text style={{ color: theme.colors.muted, fontFamily: theme.fonts.regular, textAlign: isRTL ? 'right' : 'left' }}>
              {t('settings.aboutMessage')}
            </Text>
            <Pressable
              onPress={() => setAboutVisible(false)}
              style={[styles.modalButton, { backgroundColor: theme.colors.accent }]}
            >
              <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.medium }}>{t('common.close')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  aboutCard: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export const Settings = memo(SettingsComponent);
