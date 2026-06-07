import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetMonthlyCompilationQuery } from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const MonthlyCompilationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, isLoading } = useGetMonthlyCompilationQuery();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Monthly Compilation</Text>
      {(data ?? []).map((item: any) => (
        <TouchableOpacity
          key={item.month}
          style={styles.card}
          onPress={() => navigation.navigate('CAQuiz', { month: item.month })}
        >
          <Text style={styles.month}>{item.month}</Text>
          <Text style={styles.count}>{item.articleCount} articles · Tap to quiz →</Text>
        </TouchableOpacity>
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
  month: { ...typography.h3, color: colors.primary },
  count: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
