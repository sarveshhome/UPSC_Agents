import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { addNote, updateNote, deleteNote } from '../slice/notesSlice';
import type { RootState } from '../../../store';
import type { Note } from '../../../types';

type EditorState = { visible: boolean; note: Partial<Note> & { id?: string } };

export const NotesScreen: React.FC = () => {
  const dispatch = useDispatch();
  const notes = useSelector((s: RootState) => s.notes.items);
  const [editor, setEditor] = useState<EditorState>({ visible: false, note: {} });

  const openCreate = () => setEditor({ visible: true, note: { title: '', content: '' } });
  const openEdit = (note: Note) => setEditor({ visible: true, note: { ...note } });

  const handleSave = () => {
    const { id, title, content, subject } = editor.note;
    if (!title || !content) return;
    if (id) {
      dispatch(updateNote({ id, title, content, subject }));
    } else {
      dispatch(addNote({
        id: Date.now().toString(),
        title,
        content,
        subject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
    setEditor({ visible: false, note: {} });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: Note }) => (
          <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>
            <View style={styles.footer}>
              {item.subject && <Text style={styles.tag}>{item.subject}</Text>}
              <Text style={styles.date}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
              <TouchableOpacity onPress={() => dispatch(deleteNote(item.id))}>
                <Text style={styles.deleteBtn}>🗑</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.empty}>No notes yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={editor.visible} animationType="slide" onRequestClose={() => setEditor({ visible: false, note: {} })}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editor.note.id ? 'Edit Note' : 'New Note'}</Text>
            <TouchableOpacity onPress={() => setEditor({ visible: false, note: {} })}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.titleInput} placeholder="Title" placeholderTextColor={colors.textSecondary}
            value={editor.note.title ?? ''} onChangeText={v => setEditor(e => ({ ...e, note: { ...e.note, title: v } }))} />
          <TextInput style={styles.subjectInput} placeholder="Subject (optional)" placeholderTextColor={colors.textSecondary}
            value={editor.note.subject ?? ''} onChangeText={v => setEditor(e => ({ ...e, note: { ...e.note, subject: v } }))} />
          <TextInput style={styles.contentInput} placeholder="Write your note..." placeholderTextColor={colors.textSecondary}
            multiline value={editor.note.content ?? ''}
            onChangeText={v => setEditor(e => ({ ...e, note: { ...e.note, content: v } }))} />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 80 },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  noteTitle: { ...typography.h3, color: colors.text },
  noteContent: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  tag: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4, ...typography.caption, color: colors.primary },
  date: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  deleteBtn: { fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: spacing.xl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  empty: { ...typography.h3, color: colors.text },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modal: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { ...typography.h2, color: colors.text },
  closeBtn: { fontSize: 20, color: colors.textSecondary },
  titleInput: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, ...typography.h3, color: colors.text, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  subjectInput: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, ...typography.body, color: colors.text, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  contentInput: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, ...typography.body, color: colors.text, flex: 1, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', ...typography.h3 },
});
