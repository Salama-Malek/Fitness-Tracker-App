import { memo, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { eachDayOfInterval, eachWeekOfInterval, endOfWeek, parseISO, startOfMonth, subDays } from 'date-fns';

import { Header } from '../components/Header';
import { useWorkouts } from '../store/useWorkouts';
import { useAppTheme } from '../store/useTheme';
import { useLanguageStore } from '../store/useLanguage';

const width = Dimensions.get('window').width - 32;

const StatisticsComponent = () => {
  const { workouts } = useWorkouts();
  const theme = useAppTheme();
  const isRTL = useLanguageStore((state) => state.isRTL);
  const { t, i18n } = useTranslation();

  const today = useMemo(() => new Date(), []);

  const totals = useMemo(
    () =>
      workouts.reduce(
        (acc, workout) => {
          acc.calories += workout.calories;
          acc.duration += workout.duration;
          return acc;
        },
        { calories: 0, duration: 0 },
      ),
    [workouts],
  );

  const longestWorkout = useMemo(() => {
    if (!workouts.length) {
      return null;
    }
    return [...workouts].sort((a, b) => b.duration - a.duration)[0];
  }, [workouts]);

  const weeklyTrend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    const labels = days.map((day) =>
      new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(day),
    );
    const calories = days.map((day) =>
      workouts
        .filter((item) => item.date === day.toISOString().split('T')[0])
        .reduce((total, current) => total + current.calories, 0),
    );
    const duration = days.map((day) =>
      workouts
        .filter((item) => item.date === day.toISOString().split('T')[0])
        .reduce((total, current) => total + current.duration, 0),
    );
    return { labels, calories, duration };
  }, [i18n.language, today, workouts]);

  const monthlyTrend = useMemo(() => {
    const weekStarts = eachWeekOfInterval(
      { start: startOfMonth(today), end: today },
      { weekStartsOn: 1 },
    );
    const labels: string[] = [];
    const calories: number[] = [];
    const duration: number[] = [];

    weekStarts.forEach((start) => {
      const end = endOfWeek(start, { weekStartsOn: 1 });
      const label = `${new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }).format(start)} - ${new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
      }).format(end)}`;
      labels.push(label);

      const totalsForWeek = workouts.reduce(
        (acc, workout) => {
          const date = parseISO(workout.date);
          if (date >= start && date <= end) {
            acc.calories += workout.calories;
            acc.duration += workout.duration;
          }
          return acc;
        },
        { calories: 0, duration: 0 },
      );
      calories.push(totalsForWeek.calories);
      duration.push(totalsForWeek.duration);
    });

    return {
      labels: labels.length ? labels : [new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(today)],
      calories: calories.length ? calories : [0],
      duration: duration.length ? duration : [0],
    };
  }, [i18n.language, today, workouts]);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
      fillShadowGradientFrom: theme.colors.accent,
      fillShadowGradientTo: theme.colors.accent,
      fillShadowGradientToOpacity: 0.25,
      decimalPlaces: 0,
    }),
    [theme.colors.accent, theme.colors.surface],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title={t('statistics.title')} />

      <View style={styles.metricsRow}>
        <MetricCard label={t('statistics.calories')} value={`${totals.calories.toLocaleString()} kcal`} />
        <MetricCard label={t('statistics.duration')} value={`${totals.duration.toLocaleString()} min`} />
      </View>

      {longestWorkout ? (
        <View style={[styles.highlightCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.muted, fontFamily: theme.fonts.regular, textAlign: isRTL ? 'right' : 'left' }}>
            {t('workouts.durationLong')}
          </Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 18, textAlign: isRTL ? 'right' : 'left' }}>
            {longestWorkout.name}
          </Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.regular, textAlign: isRTL ? 'right' : 'left' }}>
            {longestWorkout.duration} min · {longestWorkout.calories} kcal
          </Text>
        </View>
      ) : null}

      <View style={styles.chartBlock}>
        <Text style={[styles.chartTitle, { color: theme.colors.text, fontFamily: theme.fonts.medium, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('statistics.weeklyTitle')}
        </Text>
        {workouts.length ? (
          <LineChart
            data={{
              labels: weeklyTrend.labels,
              datasets: [
                { data: weeklyTrend.calories, color: () => theme.colors.accent, strokeWidth: 3 },
                { data: weeklyTrend.duration, color: () => theme.colors.muted, strokeWidth: 3 },
              ],
              legend: [t('dashboard.weeklyCalories'), t('dashboard.weeklyDuration')],
            }}
            width={width}
            height={220}
            bezier
            chartConfig={chartConfig}
            style={styles.chart}
          />
        ) : (
          <Empty text={t('statistics.empty')} />
        )}
      </View>

      <View style={styles.chartBlock}>
        <Text style={[styles.chartTitle, { color: theme.colors.text, fontFamily: theme.fonts.medium, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('statistics.monthlyTitle')}
        </Text>
        {workouts.length ? (
          <LineChart
            data={{
              labels: monthlyTrend.labels,
              datasets: [
                { data: monthlyTrend.calories, color: () => theme.colors.accent, strokeWidth: 3 },
                { data: monthlyTrend.duration, color: () => theme.colors.muted, strokeWidth: 3 },
              ],
              legend: [t('dashboard.monthlyCalories'), t('dashboard.monthlyDuration')],
            }}
            width={width}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        ) : (
          <Empty text={t('statistics.empty')} />
        )}
      </View>
    </ScrollView>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => {
  const theme = useAppTheme();
  const isRTL = useLanguageStore((state) => state.isRTL);
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <Text style={{ color: theme.colors.muted, fontFamily: theme.fonts.regular, textAlign: isRTL ? 'right' : 'left' }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 20, textAlign: isRTL ? 'right' : 'left' }}>{value}</Text>
    </View>
  );
};

const Empty = ({ text }: { text: string }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.empty, { borderColor: theme.colors.border }]}>
      <Text style={{ color: theme.colors.muted, fontFamily: theme.fonts.regular, textAlign: 'center' }}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  highlightCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 6,
  },
  chartBlock: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  chartTitle: {
    fontSize: 18,
  },
  chart: {
    borderRadius: 24,
  },
  empty: {
    height: 160,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const Statistics = memo(StatisticsComponent);
