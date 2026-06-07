import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetAIRecommendationsQuery } from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const AIRecommendationsScreen: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetAIRecommendationsQuery();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (isError || !data) return <Text style={styles.error}>Failed to load recommendations</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>AI Recommendations</Text>

      <Text style={styles.section}>⚠️ Weak Topics</Text>
      {data.weakTopics?.map((t: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{t.subject} — {t.topic}</Text>
          <Text style={styles.cardSub}>{t.reason}</Text>
        </View>
      ))}

      <Text style={styles.section}>🗺️ Learning Path</Text>
      {data.learningPath?.map((w: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>Week {w.week}: {w.focus}</Text>
          <Text style={styles.cardSub}>Target accuracy: {w.targetAccuracy}%</Text>
          {w.resources?.map((r: string, j: number) => (
            <Text key={j} style={styles.resource}>• {r}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  section: { ...typography.h3, color: colors.primary, marginVertical: spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm, elevation: 2,
  },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  resource: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  error: { flex: 1, textAlign: 'center', color: colors.error, marginTop: 40 },
});
