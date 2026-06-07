import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../../shared/theme';
import { useGetSubjectsQuery } from '../../../store/api';
import type { TestStackParamList, TestType } from '../../../types';

type Nav = NativeStackNavigationProp<TestStackParamList, 'TestHome'>;

const TEST_TYPES: { type: TestType; label: string; emoji: string; count: number; time: number }[] = [
  { type: 'mock', label: 'Mock Test', emoji: '📝', count: 30, time: 3600 },
  { type: 'sectional', label: 'Sectional Test', emoji: '📖', count: 15, time: 1800 },
  { type: 'daily', label: 'Daily Quiz', emoji: '⚡', count: 10, time: 600 },
];

export const TestHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose Test Type</Text>
      {TEST_TYPES.map(t => (
        <TouchableOpacity key={t.type} style={styles.card}
          onPress={() => navigation.navigate('MockTest', {
            type: t.type,
            subject: t.type === 'sectional' ? selectedSubject : undefined,
            questionCount: t.count,
            timeLimit: t.time,
          })}>
          <Text style={styles.cardEmoji}>{t.emoji}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{t.label}</Text>
            <Text style={styles.cardSub}>{t.count} Qs · {t.time / 60} min</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.title, { marginTop: spacing.lg }]}>Sectional Subject</Text>
      <View style={styles.chips}>
        {subjects.map(s => (
          <TouchableOpacity key={s} style={[styles.chip, selectedSubject === s && styles.chipActive]}
            onPress={() => setSelectedSubject(prev => prev === s ? undefined : s)}>
            <Text style={[styles.chipText, selectedSubject === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, elevation: 1 },
  cardEmoji: { fontSize: 28, marginRight: spacing.md },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.h3, color: colors.text },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 22, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '700' },
});
