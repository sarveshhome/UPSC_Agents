import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { clearSession } from '../slice/testSlice';
import type { TestStackParamList } from '../../../types';

type Route = RouteProp<TestStackParamList, 'TestResult'>;

export const TestResultScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { result } = route.params;
  const { correct, incorrect, unattempted, totalQuestions, score, timeTaken, subjectBreakdown } = result;

  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const handleDone = () => {
    dispatch(clearSession());
    navigation.navigate('Tests');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Your Score</Text>
        <Text style={styles.score}>{score}%</Text>
        <Text style={styles.time}>Time: {mins}m {secs}s</Text>
      </View>

      <View style={styles.statsRow}>
        <StatBox label="Correct" value={correct} color={colors.success} />
        <StatBox label="Wrong" value={incorrect} color={colors.error} />
        <StatBox label="Skipped" value={unattempted} color={colors.textSecondary} />
        <StatBox label="Total" value={totalQuestions} color={colors.primary} />
      </View>

      <Text style={styles.sectionTitle}>Subject Breakdown</Text>
      {Object.entries(subjectBreakdown).map(([subj, data]) => (
        <View key={subj} style={styles.breakdownRow}>
          <Text style={styles.breakdownSubj}>{subj}</Text>
          <Text style={styles.breakdownScore}>{data.correct}/{data.total}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${(data.correct / data.total) * 100}%` as any }]} />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const StatBox: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  scoreCard: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg },
  scoreLabel: { color: '#ffffffaa', ...typography.body },
  score: { color: '#fff', fontSize: 56, fontWeight: '800' },
  time: { color: '#ffffffbb', ...typography.caption, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginHorizontal: 3 },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  breakdownRow: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  breakdownSubj: { ...typography.body, color: colors.text, marginBottom: spacing.xs },
  breakdownScore: { ...typography.caption, color: colors.primary, fontWeight: '700', marginBottom: spacing.xs },
  barBg: { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  barFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  doneBtnText: { color: '#fff', ...typography.h3 },
});
