import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/components/Button';
import { useGetNextQuestionQuery, useSubmitAnswerMutation } from '../../../store/api';
import { setCurrentQuestion, toggleOption } from '../slice/homeSlice';
import type { RootState } from '../../../store';
import type { HomeStackParamList } from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DailyQuestions'>;

export const DailyQuestionsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentQuestion, selectedOptions } = useSelector((s: RootState) => s.home);
  const { data: question, isFetching, refetch } = useGetNextQuestionQuery();
  const [submitAnswer, { isLoading: submitting }] = useSubmitAnswerMutation();

  React.useEffect(() => {
    if (question) dispatch(setCurrentQuestion(question));
  }, [question]);

  const q = currentQuestion;
  const options = q ? (['Option1','Option2','Option3','Option4','Option5'] as const).map(k => ({ key: k, value: q[k] })) : [];

  const handleSubmit = async () => {
    if (!selectedOptions.length || !q) return;
    try {
      const result = await submitAnswer({ answer: selectedOptions.join(',') }).unwrap();
      navigation.navigate('AnswerResult', { result, question: q });
    } catch {}
  };

  if (isFetching) return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.badge}>Daily Question</Text>
      <Text style={styles.question}>{q?.Ques}</Text>

      {options.map(({ key, value }) => {
        const selected = selectedOptions.includes(key);
        return (
          <TouchableOpacity key={key} style={[styles.option, selected && styles.optionSelected]}
            onPress={() => dispatch(toggleOption(key))}>
            <View style={[styles.dot, selected && styles.dotSelected]} />
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{value}</Text>
          </TouchableOpacity>
        );
      })}

      <Button title="Submit Answer" onPress={handleSubmit}
        disabled={!selectedOptions.length} loading={submitting} style={styles.submit} />
      <Button title="Skip / Next Question" variant="outline" onPress={() => refetch()} style={styles.skip} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background },
  center: { flex: 1 },
  badge: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.sm },
  question: { ...typography.h3, color: colors.text, marginBottom: spacing.lg, lineHeight: 26 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#E8F0FE' },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, marginRight: spacing.sm },
  dotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { ...typography.body, color: colors.text, flex: 1 },
  optionTextSelected: { color: colors.primary, fontWeight: '600' },
  submit: { marginTop: spacing.lg },
  skip: { marginTop: spacing.sm },
});
