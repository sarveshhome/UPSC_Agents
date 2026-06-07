import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetMonthlyReportQuery } from '../../../store/api';
import { BarChart, LineChart, RadarChart } from '../../../shared/components/charts/Charts';
import { colors, spacing, typography } from '../../../shared/theme';

export const MonthlyReportScreen: React.FC<{ route: any }> = ({ route }) => {
  const { month } = route.params;
  const { data, isLoading } = useGetMonthlyReportQuery(month);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (!data) return <Text style={styles.error}>No data for this month</Text>;

  const weekAccuracy = data.weeklyBreakdown.map(w => Math.round(w.accuracy));
  const weekLabels = data.weeklyBreakdown.map(w => w.week.slice(-2));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Month: {data.month}</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.val}>{data.totalAttempted}</Text>
          <Text style={styles.lbl}>Attempted</Text>
        </View>
        <View style={styles.card}>
          <Text style={[styles.val, { color: colors.success }]}>{Math.round(data.accuracy)}%</Text>
          <Text style={styles.lbl}>Accuracy</Text>
        </View>
        <View style={styles.card}>
          <Text style={[styles.val, { color: colors.secondary }]}>{Math.round(data.avgScore)}</Text>
          <Text style={styles.lbl}>Avg Score</Text>
        </View>
      </View>

      <LineChart data={weekAccuracy} labels={weekLabels} title="Weekly Accuracy Trend" />

      <RadarChart
        data={data.subjectStats.map(s => ({ subject: s.subject, accuracy: Math.round(s.accuracy) }))}
        title="Subject Accuracy"
      />

      <BarChart
        data={data.weeklyBreakdown.map(w => ({ label: `W${w.week.slice(-2)}`, value: w.totalAttempted }))}
        title="Questions per Week"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  card: {
    flex: 1, backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, alignItems: 'center', elevation: 2,
  },
  val: { ...typography.h2, color: colors.primary },
  lbl: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  error: { flex: 1, textAlign: 'center', color: colors.error, marginTop: 40 },
});
