import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetCAQuizQuery } from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const CAQuizScreen: React.FC<{ route: any }> = ({ route }) => {
  const { month } = route.params;
  const { data, isLoading } = useGetCAQuizQuery(month);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (!data?.questions?.length) return <Text style={styles.error}>No quiz for {month}</Text>;

  const score = submitted
    ? data.questions.filter((q: any, i: number) => answers[i] === q.Ans).length
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>CA Quiz — {month}</Text>

      {data.questions.map((q: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.ques}>{i + 1}. {q.Ques}</Text>
          {['Option1', 'Option2', 'Option3', 'Option4', 'Option5'].map(opt => {
            const isSelected = answers[i] === opt;
            const isCorrect = submitted && opt === q.Ans;
            const isWrong = submitted && isSelected && opt !== q.Ans;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.option, isSelected && styles.selected, isCorrect && styles.correct, isWrong && styles.wrong]}
                onPress={() => !submitted && setAnswers(a => ({ ...a, [i]: opt }))}
              >
                <Text style={styles.optText}>{q[opt]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {!submitted ? (
        <TouchableOpacity style={styles.btn} onPress={() => setSubmitted(true)}>
          <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.result}>
          <Text style={styles.score}>{score}/{data.questions.length} correct</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, elevation: 2 },
  ques: { ...typography.body, color: colors.text, marginBottom: spacing.sm, fontWeight: '600' },
  option: { padding: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '20' },
  correct: { borderColor: colors.success, backgroundColor: colors.success + '20' },
  wrong: { borderColor: colors.error, backgroundColor: colors.error + '20' },
  optText: { ...typography.body, color: colors.text },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  btnText: { color: '#fff', ...typography.h3 },
  result: { alignItems: 'center', padding: spacing.lg },
  score: { ...typography.h1, color: colors.success },
  error: { flex: 1, textAlign: 'center', color: colors.error, marginTop: 40 },
});
