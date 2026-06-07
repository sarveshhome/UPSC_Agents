import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/components/Button';
import type { HomeStackParamList } from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Explanation'>;

export const ExplanationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { question } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explanation</Text>
      <Text style={styles.question}>{question.Ques}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Correct Answer</Text>
        <Text style={styles.answer}>{question.Ans}</Text>
      </View>

      {question.explanation ? (
        <View style={styles.card}>
          <Text style={styles.label}>Explanation</Text>
          <Text style={styles.body}>{question.explanation}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.body}>
            The correct answer is {question.Ans}.{'\n\n'}
            {['Option1','Option2','Option3','Option4','Option5'].map(k =>
              `${k}: ${(question as any)[k]}`
            ).join('\n')}
          </Text>
        </View>
      )}

      <Button title="Next Question" onPress={() => navigation.navigate('DailyQuestions')} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.primary, marginBottom: spacing.md },
  question: { ...typography.body, color: colors.text, marginBottom: spacing.lg, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.xs },
  answer: { ...typography.body, color: colors.success, fontWeight: '700' },
  body: { ...typography.body, color: colors.text, lineHeight: 22 },
  btn: { marginTop: spacing.md },
});
