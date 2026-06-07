import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetDailyCurrentAffairsQuery } from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const DailyCurrentAffairsScreen: React.FC = () => {
  const { data, isLoading, isError } = useGetDailyCurrentAffairsQuery();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (isError || !data) return <Text style={styles.error}>Failed to load current affairs</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Today's Current Affairs</Text>
      {data.map(article => (
        <View key={article.id} style={styles.card}>
          <View style={styles.meta}>
            <Text style={styles.subject}>{article.subject}</Text>
            <Text style={styles.date}>{article.date}</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.summary}>{article.summary}</Text>
          <Text style={styles.source}>Source: {article.source}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.md, elevation: 2,
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  subject: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  date: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  summary: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  source: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic' },
  error: { flex: 1, textAlign: 'center', color: colors.error, marginTop: 40 },
});
