import { ReactNode, memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

type HeaderProps = {
  title: string;
  actions?: ReactNode;
};

const HeaderComponent = ({ title, actions }: HeaderProps) => {
  const theme = useAppTheme();
  const isRTL = useLanguageStore((state) => state.isRTL);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          flexDirection: isRTL ? 'row-reverse' : 'row',
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
        {title}
      </Text>
      {actions ? <View style={[styles.actions, isRTL && styles.actionsRTL]}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionsRTL: {
    flexDirection: 'row-reverse',
  },
});

export const Header = memo(HeaderComponent);
