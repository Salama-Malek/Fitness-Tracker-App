import { memo, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { eachDayOfInterval, eachWeekOfInterval, endOfWeek, parseISO, startOfMonth, subDays } from 'date-fns';

import { Header } from '../components/Header';
import { useWorkouts } from '../store/useWorkouts';
import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

const chartWidth = Dimensions.get('window').width - 32;

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const withOpacity = (hex: string, opacity: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const AnimatedNumber = ({ value, label }: { value: number; label: string }) => {
  const theme = useAppTheme();
  const isRTL = useLanguageStore((state) => state.isRTL);

  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.muted,
            fontFamily: theme.fonts.regular,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.text,
            fontFamily: theme.fonts.bold,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      >
        {value.toLocaleString()}
      </Text>
    </View>
  );
};

const DashboardComponent = () => {
  const { workouts } = useWorkouts();
  const theme = useAppTheme();
  const isRTL = useLanguageStore((state) => state.isRTL);
  const { t, i18n } = useTranslation();

  const today = useMemo(() => new Date(), []);

  const todaySummary = useMemo(() => {
    const todayISO = today.toISOString().split('T')[0];
    const todaysWorkouts = workouts.filter((workout) => workout.date === todayISO);
    const calories = todaysWorkouts.reduce((total, item) => total + item.calories, 0);
    const activeMinutes = todaysWorkouts.reduce((total, item) => total + item.duration, 0);
    const steps = Math.round(activeMinutes * 120);
    return { calories, activeMinutes, steps };
  }, [today, workouts]);

  const weeklyData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });

    const labels = days.map((day) =>
      new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(day).toUpperCase(),
    );
    const calories = days.map((day) =>
      workouts
        .filter((workout) => workout.date === day.toISOString().split('T')[0])
        .reduce((total, item) => total + item.calories, 0),
    );
    const duration = days.map((day) =>
      workouts
        .filter((workout) => workout.date === day.toISOString().split('T')[0])
        .reduce((total, item) => total + item.duration, 0),
    );
    return { labels, calories, duration };
  }, [i18n.language, today, workouts]);

  const monthlyData = useMemo(() => {
    const monthStart = startOfMonth(today);
    const weeks = eachWeekOfInterval(
      { start: monthStart, end: today },
      { weekStartsOn: 1 },
    );

    const data = weeks.map((start) => {
      const weekEnd = endOfWeek(start, { weekStartsOn: 1 });
      const label = `${new Intl.DateTimeFormat(i18n.language, { day: 'numeric' }).format(start)}-${new Intl.DateTimeFormat(i18n.language, { day: 'numeric' }).format(
        weekEnd,
      )}`;

      const totals = workouts.reduce(
        (acc, workout) => {
          const date = parseISO(workout.date);
          if (date >= start && date <= weekEnd) {
            acc.calories += workout.calories;
            acc.duration += workout.duration;
          }
          return acc;
        },
        { calories: 0, duration: 0 },
      );

      return { label, ...totals };
    });

    if (!data.length) {
      const label = new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(today);
      return { labels: [label], calories: [0], duration: [0] };
    }

    return {
      labels: data.map((item) => item.label),
      calories: data.map((item) => item.calories),
      duration: data.map((item) => item.duration),
    };
  }, [i18n.language, today, workouts]);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      color: (opacity = 1) => withOpacity(theme.colors.accent, opacity),
      labelColor: (opacity = 1) => withOpacity(theme.colors.muted, opacity),
      fillShadowGradientFrom: theme.colors.accent,
      fillShadowGradientTo: theme.colors.accent,
      fillShadowGradientToOpacity: 0.2,
      decimalPlaces: 0,
    }),
    [theme.colors.accent, theme.colors.muted, theme.colors.surface],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Header title={t('dashboard.title')} />

      <View style={[styles.section, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <AnimatedNumber value={todaySummary.steps} label={t('dashboard.steps')} />
        <AnimatedNumber value={todaySummary.calories} label={t('dashboard.calories')} />
        <AnimatedNumber value={todaySummary.activeMinutes} label={t('dashboard.activeMinutes')} />
      </View>

      <View style={styles.sectionContainer}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontFamily: theme.fonts.medium, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('dashboard.weeklyProgress')}
        </Text>
        {workouts.length ? (
          <LineChart
            data={{
              labels: weeklyData.labels,
              datasets: [
                { data: weeklyData.calories, color: () => theme.colors.accent, strokeWidth: 3 },
                { data: weeklyData.duration, color: () => theme.colors.muted, strokeWidth: 3 },
              ],
              legend: [t('dashboard.weeklyCalories'), t('dashboard.weeklyDuration')],
            }}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <Placeholder text={t('statistics.empty')} />
        )}
      </View>

      <View style={styles.sectionContainer}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontFamily: theme.fonts.medium, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('dashboard.monthlyProgress')}
        </Text>
        {workouts.length ? (
          <BarChart
            data={{
              labels: monthlyData.labels,
              datasets: [
                {
                  data: monthlyData.calories,
                },
              ],
            }}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showBarTops={false}
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
          />
        ) : (
          <Placeholder text={t('statistics.empty')} />
        )}
      </View>
    </ScrollView>
  );
};

const Placeholder = ({ text }: { text: string }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.placeholder, { borderColor: theme.colors.border }]}>
      <Text style={{ color: theme.colors.muted, fontFamily: theme.fonts.regular }}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 24,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 28,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
  },
  chart: {
    borderRadius: 24,
    paddingRight: 0,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    borderWidth: 1,
    borderRadius: 20,
    borderStyle: 'dashed',
  },
});

export const Dashboard = memo(DashboardComponent);
