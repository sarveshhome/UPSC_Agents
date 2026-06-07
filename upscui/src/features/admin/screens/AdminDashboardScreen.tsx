import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import {
  useGetAdminQuestionsQuery,
  useAdminCreateQuestionMutation,
  useAdminDeleteQuestionMutation,
  useGetAdminUserStatsQuery,
  useGetAdminAnalyticsQuery,
} from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const AdminDashboardScreen: React.FC = () => {
  const { data: questions, isLoading, refetch } = useGetAdminQuestionsQuery({});
  const { data: stats } = useGetAdminUserStatsQuery();
  const { data: analytics } = useGetAdminAnalyticsQuery();
  const [createQuestion] = useAdminCreateQuestionMutation();
  const [deleteQuestion] = useAdminDeleteQuestionMutation();

  const [form, setForm] = useState({ subject: '', topic: '', difficulty: 'medium', ques: '', ans: '' });

  const handleCreate = async () => {
    if (!form.subject || !form.ques || !form.ans) {
      Alert.alert('Validation', 'Subject, question, and answer are required.');
      return;
    }
    await createQuestion({
      subject: form.subject,
      topic: form.topic,
      difficulty: form.difficulty,
      payload: { Ques: form.ques, Ans: form.ans },
    });
    setForm({ subject: '', topic: '', difficulty: 'medium', ques: '', ans: '' });
    refetch();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this question?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteQuestion(id); refetch(); } },
    ]);
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Admin Dashboard</Text>

      {/* Stats */}
      {stats && (
        <View style={styles.statsRow}>
          {[
            { label: 'Total Tests', value: stats.totalTests },
            { label: 'Bookmarks', value: stats.totalBookmarks },
            { label: 'Notes', value: stats.totalNotes },
            { label: 'Active Subs', value: stats.activeSubscriptions },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {analytics && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Platform Analytics</Text>
          <Text style={styles.cardSub}>Avg Score: {analytics.avgScore}%  ·  Total Tests: {analytics.totalTests}</Text>
          {Object.entries(analytics.subjectDistribution ?? {}).map(([subj, count]: any) => (
            <Text key={subj} style={styles.cardSub}>{subj}: {count} tests</Text>
          ))}
        </View>
      )}

      {/* Add Question */}
      <Text style={styles.section}>➕ Add Question</Text>
      {(['subject', 'topic', 'ques', 'ans'] as const).map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          placeholderTextColor={colors.textSecondary}
          value={form[field]}
          onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
          multiline={field === 'ques'}
        />
      ))}
      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={styles.btnText}>Create Question</Text>
      </TouchableOpacity>

      {/* Question List */}
      <Text style={styles.section}>📋 Managed Questions ({questions?.length ?? 0})</Text>
      {questions?.map((q: any) => (
        <View key={q.id} style={styles.qCard}>
          <Text style={styles.cardTitle}>{q.payload?.Ques ?? 'No question text'}</Text>
          <Text style={styles.cardSub}>{q.subject} · {q.difficulty}</Text>
          <TouchableOpacity onPress={() => handleDelete(q.id)}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, alignItems: 'center', elevation: 2,
  },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.md, elevation: 2,
  },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  section: { ...typography.h3, color: colors.primary, marginVertical: spacing.sm },
  input: {
    backgroundColor: colors.card, borderRadius: 8, padding: spacing.sm,
    color: colors.text, marginBottom: spacing.sm, ...typography.body,
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: 8,
    padding: spacing.sm, alignItems: 'center', marginBottom: spacing.md,
  },
  btnText: { color: '#fff', fontWeight: '600', ...typography.body },
  qCard: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm, elevation: 1,
  },
  deleteBtn: { color: colors.error, marginTop: spacing.xs, ...typography.caption },
});
