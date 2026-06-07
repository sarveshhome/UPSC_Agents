import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/components/Button';
import type { HomeStackParamList } from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'AnswerResult'>;

export const AnswerResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result, question } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.banner, result.correct ? styles.correct : styles.wrong]}>
        <Text style={styles.bannerText}>{result.correct ? '✅ Correct!' : '❌ Incorrect'}</Text>
      </View>

      <Text style={styles.label}>Question</Text>
      <Text style={styles.question}>{result.question}</Text>

      <Text style={styles.label}>Your Answer</Text>
      <Text style={[styles.answer, result.correct ? styles.correctText : styles.wrongText]}>
        {result.your_answer}
      </Text>

      {!result.correct && (
        <>
          <Text style={styles.label}>Correct Answer</Text>
          <Text style={[styles.answer, styles.correctText]}>{result.correct_answer}</Text>
        </>
      )}

      <Button title="View Explanation" variant="outline"
        onPress={() => navigation.navigate('Explanation', { question, result })}
        style={styles.btn} />
      <Button title="Next Question"
        onPress={() => navigation.navigate('DailyQuestions')}
        style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background },
  banner: { padding: spacing.lg, borderRadius: 12, alignItems: 'center', marginBottom: spacing.lg },
  correct: { backgroundColor: '#E8F5E9' },
  wrong: { backgroundColor: '#FFEBEE' },
  bannerText: { ...typography.h2 },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', marginTop: spacing.md },
  question: { ...typography.body, color: colors.text, marginTop: spacing.xs, lineHeight: 22 },
  answer: { ...typography.body, fontWeight: '600', marginTop: spacing.xs },
  correctText: { color: colors.success },
  wrongText: { color: colors.error },
  btn: { marginTop: spacing.md },
});
