import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { useSearchQuestionsQuery, useGetSubjectsQuery } from '../../../store/api';
import { setFilters, clearFilters } from '../slice/searchSlice';
import { addBookmark } from '../../bookmark/slice/bookmarkSlice';
import type { RootState } from '../../../store';
import type { Question } from '../../../types';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const SearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((s: RootState) => s.search.filters);
  const [inputQuery, setInputQuery] = useState('');
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: results = [], isFetching } = useSearchQuestionsQuery(filters, { skip: !filters.query });

  const handleSearch = () => dispatch(setFilters({ query: inputQuery }));

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search questions, topics..."
          placeholderTextColor={colors.textSecondary}
          value={inputQuery}
          onChangeText={setInputQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {filters.query ? (
          <TouchableOpacity onPress={() => { setInputQuery(''); dispatch(clearFilters()); }} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        <FlatList horizontal data={['All', ...subjects]} keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = item === 'All' ? !filters.subject : filters.subject === item;
            return (
              <TouchableOpacity style={[styles.chip, active && styles.chipActive]}
                onPress={() => dispatch(setFilters({ subject: item === 'All' ? undefined : item }))}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }} />
      </View>

      <View style={styles.filterRow}>
        <FlatList horizontal data={DIFFICULTIES} keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = filters.difficulty === item;
            return (
              <TouchableOpacity style={[styles.chip, active && styles.chipActive]}
                onPress={() => dispatch(setFilters({ difficulty: active ? undefined : item as any }))}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }} />
      </View>

      {isFetching
        ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        : (
          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.list}
            renderItem={({ item }: { item: Question }) => (
              <View style={styles.card}>
                <Text style={styles.question}>{item.Ques}</Text>
                <View style={styles.cardFooter}>
                  {item.subject && <Text style={styles.tag}>{item.subject}</Text>}
                  {item.difficulty && <Text style={styles.tag}>{item.difficulty}</Text>}
                  <TouchableOpacity onPress={() =>
                    dispatch(addBookmark({ id: Date.now().toString(), questionId: item.id, question: item, createdAt: new Date().toISOString() }))}>
                    <Text style={styles.bookmarkBtn}>🔖</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={filters.query ? <Text style={styles.empty}>No results found</Text> : <Text style={styles.empty}>Enter a search term above</Text>}
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: spacing.md, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, padding: spacing.md, color: colors.text, ...typography.body },
  clearBtn: { padding: spacing.md },
  clearBtnText: { color: colors.textSecondary, fontSize: 16 },
  filterRow: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  question: { ...typography.body, color: colors.text, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  tag: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4, ...typography.caption, color: colors.textSecondary },
  bookmarkBtn: { marginLeft: 'auto' as any, fontSize: 18 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, ...typography.body },
});
