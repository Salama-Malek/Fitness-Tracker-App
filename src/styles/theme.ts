export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  shadow: string;
};

export type ThemeFonts = {
  regular: string;
  medium: string;
  bold: string;
  arabic: string;
  russian: string;
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: ThemeFonts;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#1e293b',
    muted: '#64748b',
    accent: '#38bdf8',
    border: '#e2e8f0',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    arabic: 'Cairo_600SemiBold',
    russian: 'Roboto_500Medium',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#cbd5f5',
    accent: '#38bdf8',
    border: '#334155',
    shadow: 'rgba(2, 6, 23, 0.6)',
  },
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    arabic: 'Cairo_600SemiBold',
    russian: 'Roboto_500Medium',
  },
};

export const themeByMode: Record<ThemeMode, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export const getTheme = (mode: ThemeMode) => themeByMode[mode];
