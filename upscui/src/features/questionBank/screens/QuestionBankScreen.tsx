import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../../shared/theme';
import { useGetQuestionsQuery, useGetSubjectsQuery } from '../../../store/api';
import type { Question } from '../../../types';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export const QuestionBankScreen: React.FC = () => {
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState('All');

  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: questions = [], isFetching } = useGetQuestionsQuery({
    subject,
    difficulty: difficulty === 'All' ? undefined : difficulty,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Subject</Text>
      <FlatList horizontal data={['All', ...subjects]} keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        renderItem={({ item }) => {
          const active = (item === 'All' ? !subject : subject === item);
          return (
            <TouchableOpacity style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSubject(item === 'All' ? undefined : item)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }} />

      <Text style={styles.sectionLabel}>Difficulty</Text>
      <FlatList horizontal data={DIFFICULTIES} keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        renderItem={({ item }) => {
          const active = difficulty === item;
          return (
            <TouchableOpacity style={[styles.chip, active && styles.chipActive]}
              onPress={() => setDifficulty(item)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }} />

      {isFetching ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : (
        <FlatList data={questions} keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: Question }) => (
            <View style={styles.card}>
              {item.difficulty && (
                <Text style={[styles.badge, styles[`badge_${item.difficulty?.toLowerCase()}`]]}>
                  {item.difficulty}
                </Text>
              )}
              <Text style={styles.question}>{item.Ques}</Text>
              <Text style={styles.answer}>Ans: {item.Ans}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No questions found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.md },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  chipRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4, marginBottom: spacing.xs },
  badge_easy: { backgroundColor: '#E8F5E9' },
  badge_medium: { backgroundColor: '#FFF8E1' },
  badge_hard: { backgroundColor: '#FFEBEE' },
  question: { ...typography.body, color: colors.text, lineHeight: 20 },
  answer: { ...typography.caption, color: colors.primary, marginTop: spacing.xs, fontWeight: '600' },
  loader: { marginTop: spacing.xl },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
} as any);
