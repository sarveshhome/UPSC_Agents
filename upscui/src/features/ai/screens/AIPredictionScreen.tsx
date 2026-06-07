import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetAIPredictionQuery } from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const AIPredictionScreen: React.FC = () => {
  const { data, isLoading, isError } = useGetAIPredictionQuery();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (isError || !data) return <Text style={styles.error}>No prediction data. Complete some tests first.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>UPSC Prediction</Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={[styles.scoreValue, { color: colors.success }]}>{data.successProbability}%</Text>
          <Text style={styles.scoreLabel}>Success Probability</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>~{data.rankPrediction?.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>Rank Prediction</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={[styles.scoreValue, { color: colors.secondary }]}>{data.confidenceScore}%</Text>
          <Text style={styles.scoreLabel}>Confidence</Text>
        </View>
      </View>

      <Text style={styles.section}>💡 Insights</Text>
      {data.insights?.map((ins: string, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardText}>{ins}</Text>
        </View>
      ))}

      <Text style={styles.section}>🎯 Improvement Areas</Text>
      {data.improvementAreas?.map((area: string, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardText}>{area}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  scoreCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, alignItems: 'center', elevation: 2,
  },
  scoreValue: { ...typography.h2 },
  scoreLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  section: { ...typography.h3, color: colors.primary, marginVertical: spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm, elevation: 1,
  },
  cardText: { ...typography.body, color: colors.text },
  error: { flex: 1, textAlign: 'center', color: colors.error, marginTop: 40 },
});
