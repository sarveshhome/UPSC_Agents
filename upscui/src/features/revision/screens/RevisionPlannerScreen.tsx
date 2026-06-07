import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import {
  useGetRevisionScheduleQuery,
  useAddRevisionTopicMutation,
  useUpdateRevisionReviewMutation,
} from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const RevisionPlannerScreen: React.FC = () => {
  const { data, isLoading, refetch } = useGetRevisionScheduleQuery();
  const [addTopic] = useAddRevisionTopicMutation();
  const [reviewTopic] = useUpdateRevisionReviewMutation();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');

  const handleAdd = async () => {
    if (!topic.trim() || !subject.trim()) return;
    await addTopic({ topic, subject, quality: 0 });
    setTopic(''); setSubject('');
    refetch();
  };

  const handleReview = async (id: string, quality: number) => {
    await reviewTopic({ id, topic: '', subject: '', quality });
    refetch();
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Smart Revision Planner</Text>

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Topic"
          placeholderTextColor={colors.textSecondary}
          value={topic}
          onChangeText={setTopic}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Subject"
          placeholderTextColor={colors.textSecondary}
          value={subject}
          onChangeText={setSubject}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>📅 Due Today ({data?.due?.length ?? 0})</Text>
      {data?.due?.map((t: any) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.cardTitle}>{t.topic}</Text>
          <Text style={styles.cardSub}>{t.subject} · Interval: {t.interval}d · EF: {t.easeFactor}</Text>
          <View style={styles.ratingRow}>
            {[0,1,2,3,4,5].map(q => (
              <TouchableOpacity key={q} style={[styles.ratingBtn, q >= 3 && styles.ratingGood]}
                onPress={() => handleReview(t.id, q)}>
                <Text style={styles.ratingText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.section}>🔜 Upcoming ({data?.upcoming?.length ?? 0})</Text>
      {data?.upcoming?.map((t: any) => (
        <View key={t.id} style={[styles.card, styles.upcomingCard]}>
          <Text style={styles.cardTitle}>{t.topic}</Text>
          <Text style={styles.cardSub}>{t.subject} · Next: {t.nextReview}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  addRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.card, borderRadius: 8, padding: spacing.sm,
    color: colors.text, ...typography.body,
  },
  addBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: spacing.sm, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600' },
  section: { ...typography.h3, color: colors.primary, marginVertical: spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm, elevation: 2,
  },
  upcomingCard: { opacity: 0.7 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  ratingBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.error,
    alignItems: 'center', justifyContent: 'center',
  },
  ratingGood: { backgroundColor: colors.success },
  ratingText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
