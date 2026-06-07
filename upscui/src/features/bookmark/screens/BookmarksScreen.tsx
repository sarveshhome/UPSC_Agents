import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { removeBookmark } from '../slice/bookmarkSlice';
import type { RootState } from '../../../store';
import type { Bookmark } from '../../../types';

export const BookmarksScreen: React.FC = () => {
  const dispatch = useDispatch();
  const bookmarks = useSelector((s: RootState) => s.bookmark.items);

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: Bookmark }) => (
          <View style={styles.card}>
            <Text style={styles.question}>{item.question.Ques}</Text>
            {item.note ? <Text style={styles.note}>📌 {item.note}</Text> : null}
            <View style={styles.footer}>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <TouchableOpacity onPress={() => dispatch(removeBookmark(item.questionId))}>
                <Text style={styles.removeBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.empty}>No bookmarks yet</Text>
            <Text style={styles.emptySub}>Bookmark questions from Search or Question Bank</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  question: { ...typography.body, color: colors.text, lineHeight: 20 },
  note: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  date: { ...typography.caption, color: colors.textSecondary },
  removeBtn: { ...typography.caption, color: colors.error, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: spacing.xl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  empty: { ...typography.h3, color: colors.text },
  emptySub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
