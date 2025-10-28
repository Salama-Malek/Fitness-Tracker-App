import 'react-native-reanimated';
import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Cairo_400Regular, Cairo_600SemiBold } from '@expo-google-fonts/cairo';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';

import i18n from './i18n';
import { useAppTheme, useThemeStore } from './store/useTheme';
import { useLanguageStore } from './store/useLanguage';
import { useWorkoutsStore } from './store/useWorkouts';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const Dashboard = lazy(() => import('./pages/Dashboard').then((mod) => ({ default: mod.Dashboard })));
const Workouts = lazy(() => import('./pages/Workouts').then((mod) => ({ default: mod.Workouts })));
const Statistics = lazy(() => import('./pages/Statistics').then((mod) => ({ default: mod.Statistics })));
const Settings = lazy(() => import('./pages/Settings').then((mod) => ({ default: mod.Settings })));

const Tab = createBottomTabNavigator();

const useStoreHydration = (store: typeof useThemeStore | typeof useLanguageStore | typeof useWorkoutsStore) => {
  const [hydrated, setHydrated] = React.useState(store.persist?.hasHydrated?.() ?? false);

  useEffect(() => {
    const unsubscribe = store.persist?.onFinishHydration?.(() => setHydrated(true));
    return () => {
      unsubscribe?.();
    };
  }, [store]);

  return hydrated;
};

const AppNavigator = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'home-variant-outline',
            Workouts: 'dumbbell',
            Statistics: 'chart-line',
            Settings: 'cog-outline',
          };
          return <MaterialCommunityIcons name={icons[route.name] as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" options={{ title: t('navigation.dashboard') }} component={DashboardScreen} />
      <Tab.Screen name="Workouts" options={{ title: t('navigation.workouts') }} component={WorkoutsScreen} />
      <Tab.Screen name="Statistics" options={{ title: t('navigation.statistics') }} component={StatisticsScreen} />
      <Tab.Screen name="Settings" options={{ title: t('navigation.settings') }} component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const DashboardScreen = () => (
  <Suspense fallback={<Loading />}>
    <Dashboard />
  </Suspense>
);

const WorkoutsScreen = () => (
  <Suspense fallback={<Loading />}>
    <Workouts />
  </Suspense>
);

const StatisticsScreen = () => (
  <Suspense fallback={<Loading />}>
    <Statistics />
  </Suspense>
);

const SettingsScreen = () => (
  <Suspense fallback={<Loading />}>
    <Settings />
  </Suspense>
);

const Loading = () => {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
    </View>
  );
};

const AppContainer = () => {
  const theme = useAppTheme();
  const language = useLanguageStore((state) => state.language);

  const navigationTheme = useMemo(
    () => ({
      ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.accent,
      },
    }),
    [theme],
  );

  useEffect(() => {
    i18n.changeLanguage(language).catch(() => undefined);
  }, [language]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Cairo_400Regular,
    Cairo_600SemiBold,
    Roboto_400Regular,
    Roboto_500Medium,
  });

  const themeHydrated = useStoreHydration(useThemeStore);
  const languageHydrated = useStoreHydration(useLanguageStore);
  const workoutsHydrated = useStoreHydration(useWorkoutsStore);

  const appReady = fontsLoaded && themeHydrated && languageHydrated && workoutsHydrated;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <AppContainer />
      </I18nextProvider>
    </SafeAreaProvider>
  );
};

export default App;
