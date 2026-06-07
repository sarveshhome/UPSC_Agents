import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetWeeklyReportQuery } from '../../../store/api';
import { BarChart, RadarChart } from '../../../shared/components/charts/Charts';
import { colors, spacing, typography } from '../../../shared/theme';

export const WeeklyReportScreen: React.FC<{ route: any }> = ({ route }) => {
  const { week } = route.params;
  const { data, isLoading } = useGetWeeklyReportQuery(week);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (!data) return <Text style={styles.error}>No data for this week</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Week: {data.week}</Text>

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

      <RadarChart
        data={data.subjectStats.map(s => ({ subject: s.subject, accuracy: Math.round(s.accuracy) }))}
        title="Subject Accuracy"
      />

      <BarChart
        data={data.subjectStats.map(s => ({ label: s.subject.slice(0, 4), value: s.total }))}
        title="Questions Attempted"
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
