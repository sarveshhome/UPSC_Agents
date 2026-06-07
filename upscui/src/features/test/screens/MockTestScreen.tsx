import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { useGetTestQuestionsQuery } from '../../../store/api';
import { startSession, setAnswer, nextQuestion, prevQuestion, tick, submitSession } from '../slice/testSlice';
import type { RootState } from '../../../store';
import type { TestStackParamList, TestResult } from '../../../types';

type Route = RouteProp<TestStackParamList, 'MockTest'>;
type Nav = NativeStackNavigationProp<TestStackParamList>;

export const MockTestScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const session = useSelector((s: RootState) => s.test.session);
  const { type, subject, questionCount, timeLimit } = route.params;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: questions = [], isLoading } = useGetTestQuestionsQuery({ type, subject, count: questionCount });

  useEffect(() => {
    if (questions.length > 0 && !session) {
      dispatch(startSession({ id: Date.now().toString(), type, subject, questions, timeLimit }));
    }
  }, [questions]);

  useEffect(() => {
    if (!session?.started || session.submitted) return;
    timerRef.current = setInterval(() => {
      dispatch(tick());
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.started, session?.submitted]);

  useEffect(() => {
    if (session?.timeLeft === 0 && !session.submitted) handleSubmit();
  }, [session?.timeLeft]);

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    dispatch(submitSession());
    if (!session) return;
    const result: TestResult = buildResult(session);
    navigation.replace('TestResult', { result });
  };

  const confirmSubmit = () =>
    Alert.alert('Submit Test', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', onPress: handleSubmit },
    ]);

  if (isLoading || !session) return <View style={styles.center}><Text>Loading...</Text></View>;

  const q = session.questions[session.currentIndex];
  const options = ['Option1', 'Option2', 'Option3', 'Option4', 'Option5'] as const;
  const mins = String(Math.floor(session.timeLeft / 60)).padStart(2, '0');
  const secs = String(session.timeLeft % 60).padStart(2, '0');
  const isWarning = session.timeLeft < 60;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.progress}>{session.currentIndex + 1}/{session.questions.length}</Text>
        <Text style={[styles.timer, isWarning && styles.timerWarning]}>{mins}:{secs}</Text>
        <TouchableOpacity style={styles.submitBtn} onPress={confirmSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.question}>{q.Ques}</Text>
        {options.map(opt => {
          const val = q[opt];
          if (!val) return null;
          const selected = q.userAnswer?.split(',').includes(opt);
          return (
            <TouchableOpacity key={opt}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => dispatch(setAnswer({ index: session.currentIndex, answer: opt }))}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.replace('Option', '')}. {val}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => dispatch(prevQuestion())} disabled={session.currentIndex === 0}>
          <Text style={styles.navBtnText}>‹ Prev</Text>
        </TouchableOpacity>
        <View style={styles.palette}>
          {session.questions.map((_, i) => (
            <TouchableOpacity key={i} style={[styles.dot, i === session.currentIndex && styles.dotActive, _.userAnswer && styles.dotAnswered]}
              onPress={() => dispatch({ type: 'test/goToQuestion', payload: i })}>
              <Text style={styles.dotText}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={() => dispatch(nextQuestion())} disabled={session.currentIndex === session.questions.length - 1}>
          <Text style={styles.navBtnText}>Next ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function buildResult(session: ReturnType<typeof useSelector<any, any>>): TestResult {
  const qs = session.questions;
  const timeTaken = session.timeLimit - session.timeLeft;
  let correct = 0, incorrect = 0, unattempted = 0;
  const breakdown: Record<string, { correct: number; total: number }> = {};
  qs.forEach((q: any) => {
    const subj = q.subject ?? 'General';
    if (!breakdown[subj]) breakdown[subj] = { correct: 0, total: 0 };
    breakdown[subj].total++;
    if (!q.userAnswer) { unattempted++; return; }
    const isCorrect = new Set(q.Ans.split(',')).has(q.userAnswer);
    if (isCorrect) { correct++; breakdown[subj].correct++; }
    else incorrect++;
  });
  return { sessionId: session.id, totalQuestions: qs.length, correct, incorrect, unattempted, score: Math.round((correct / qs.length) * 100), timeTaken, subjectBreakdown: breakdown };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, padding: spacing.md },
  progress: { color: '#fff', ...typography.body, fontWeight: '700' },
  timer: { color: '#fff', ...typography.h3, fontWeight: '700' },
  timerWarning: { color: '#FF5252' },
  submitBtn: { backgroundColor: colors.secondary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8 },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  body: { padding: spacing.lg },
  question: { ...typography.h3, color: colors.text, marginBottom: spacing.lg, lineHeight: 26 },
  option: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...typography.body, color: colors.text },
  optionTextSelected: { color: '#fff', fontWeight: '600' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  navBtn: { padding: spacing.sm },
  navBtnText: { ...typography.body, color: colors.primary, fontWeight: '700' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', flex: 1, justifyContent: 'center', gap: 4 },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dotActive: { borderWidth: 2, borderColor: colors.primary },
  dotAnswered: { backgroundColor: colors.success },
  dotText: { fontSize: 10, fontWeight: '700', color: colors.text },
});
