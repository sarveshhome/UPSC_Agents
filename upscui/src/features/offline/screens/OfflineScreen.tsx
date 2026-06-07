import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  useGetOfflineQuestionsQuery,
  useOfflineSyncMutation,
  useGetNotesQuery,
  useGetBookmarksQuery,
} from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const OfflineScreen: React.FC = () => {
  const { data: offlineData, isLoading, refetch } = useGetOfflineQuestionsQuery(50);
  const [syncOffline, { isLoading: syncing }] = useOfflineSyncMutation();
  const { data: notes } = useGetNotesQuery();
  const { data: bookmarks } = useGetBookmarksQuery();

  const handleDownload = () => refetch();

  const handleSync = async (entity: 'notes' | 'bookmarks') => {
    const payload = entity === 'notes' ? notes ?? [] : bookmarks ?? [];
    await syncOffline({ entity, payload });
    Alert.alert('Sync Complete', `${payload.length} ${entity} synced successfully.`);
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Offline Mode</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📥 Question Bank</Text>
        <Text style={styles.cardSub}>
          {offlineData ? `${offlineData.count} questions downloaded` : 'No offline questions'}
        </Text>
        {offlineData?.syncedAt && (
          <Text style={styles.cardSub}>Last synced: {offlineData.syncedAt.slice(0, 19)}</Text>
        )}
        <TouchableOpacity style={styles.btn} onPress={handleDownload}>
          <Text style={styles.btnText}>Download / Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗒️ Sync Notes</Text>
        <Text style={styles.cardSub}>{notes?.length ?? 0} local notes</Text>
        <TouchableOpacity style={styles.btn} onPress={() => handleSync('notes')} disabled={syncing}>
          <Text style={styles.btnText}>{syncing ? 'Syncing…' : 'Sync Notes'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔖 Sync Bookmarks</Text>
        <Text style={styles.cardSub}>{bookmarks?.length ?? 0} local bookmarks</Text>
        <TouchableOpacity style={styles.btn} onPress={() => handleSync('bookmarks')} disabled={syncing}>
          <Text style={styles.btnText}>{syncing ? 'Syncing…' : 'Sync Bookmarks'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.md, elevation: 2,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  btn: {
    backgroundColor: colors.primary, borderRadius: 8,
    padding: spacing.sm, alignItems: 'center', marginTop: spacing.sm,
  },
  btnText: { color: '#fff', fontWeight: '600', ...typography.body },
});
