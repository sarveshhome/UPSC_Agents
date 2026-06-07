import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetAnalyticsSummaryQuery } from '../../../store/api';
import { BarChart, LineChart, PieChart, RadarChart } from '../../../shared/components/charts/Charts';
import { colors, spacing, typography } from '../../../shared/theme';

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const AnalyticsDashboardScreen: React.FC = () => {
  const { data, isLoading, isError } = useGetAnalyticsSummaryQuery();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (isError || !data) return <Text style={styles.error}>Failed to load analytics</Text>;

  const weeklyAccuracy = data.weeklyReports.map(w => Math.round(w.accuracy));
  const weeklyLabels = data.weeklyReports.map(w => w.week.slice(-2));

  const subjectBarData = data.subjectStats.map(s => ({
    label: s.subject.slice(0, 4),
    value: s.total,
    color: colors.primary,
  }));

  const pieData = [
    { label: 'Correct', value: data.subjectStats.reduce((s, x) => s + x.correct, 0), color: colors.success },
    {
      label: 'Wrong',
      value: data.subjectStats.reduce((s, x) => s + (x.total - x.correct), 0),
      color: colors.error,
    },
  ];

  const radarData = data.subjectStats.map(s => ({
    subject: s.subject,
    accuracy: Math.round(s.accuracy),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Performance Dashboard</Text>

      <View style={styles.statsRow}>
        <StatCard label="Overall Accuracy" value={`${Math.round(data.overallAccuracy)}%`} color={colors.success} />
        <StatCard label="Total Attempted" value={data.totalAttempted} />
        <StatCard label="Streak 🔥" value={`${data.streak}d`} color={colors.secondary} />
      </View>

      <LineChart
        data={weeklyAccuracy}
        labels={weeklyLabels}
        title="Weekly Accuracy (%)"
        color={colors.primaryLight}
      />

      <BarChart
        data={subjectBarData}
        title="Questions by Subject"
      />

      <PieChart data={pieData} title="Correct vs Wrong" />

      <RadarChart data={radarData} title="Subject-wise Accuracy" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, alignItems: 'center', elevation: 2,
  },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  error: { flex: 1, textAlign: 'center', color: colors.error, marginTop: 40 },
});
