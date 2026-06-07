import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetGlobalLeaderboardQuery,
  useGetWeeklyLeaderboardQuery,
  useGetStateLeaderboardQuery,
  useGetMyRankQuery,
} from '../../../store/api';
import { setTab } from '../slice/leaderboardSlice';
import type { RootState } from '../../../store';
import type { LeaderboardEntry } from '../../../types';
import { colors, spacing, typography } from '../../../shared/theme';

const TABS = ['global', 'weekly', 'state'] as const;
type Tab = typeof TABS[number];

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const EntryRow: React.FC<{ item: LeaderboardEntry; isMe: boolean }> = ({ item, isMe }) => (
  <View style={[s.row, isMe && s.meRow]}>
    <Text style={s.rank}>{MEDAL[item.rank] ?? `#${item.rank}`}</Text>
    <Text style={[s.name, isMe && { color: colors.primary, fontWeight: '700' }]}>{item.username}</Text>
    <Text style={s.xp}>{item.xp_this_week} XP</Text>
  </View>
);

export const LeaderboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { activeTab, selectedState } = useSelector((s: RootState) => (s as any).leaderboard);
  const { data: myRank } = useGetMyRankQuery();
  const { data: global,  isFetching: g } = useGetGlobalLeaderboardQuery(undefined, { skip: activeTab !== 'global' });
  const { data: weekly,  isFetching: w } = useGetWeeklyLeaderboardQuery(undefined, { skip: activeTab !== 'weekly' });
  const { data: state,   isFetching: st } = useGetStateLeaderboardQuery({ state: selectedState }, { skip: activeTab !== 'state' });

  const data = activeTab === 'global' ? global : activeTab === 'weekly' ? weekly : state;
  const loading = g || w || st;

  return (
    <View style={s.container}>
      {/* My Rank Banner */}
      {myRank?.rank && (
        <View style={s.myRankBanner}>
          <Text style={s.myRankText}>Your Rank: #{myRank.rank}  ·  {myRank.xp_this_week} XP this week</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.activeTab]}
            onPress={() => dispatch(setTab(t))}>
            <Text style={[s.tabText, activeTab === t && s.activeTabText]}>
              {t === 'global' ? '🌍 Global' : t === 'weekly' ? '📅 Weekly' : `🗺️ State`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
        : (
          <FlatList
            data={data ?? []}
            keyExtractor={item => item.user_id}
            renderItem={({ item }) => (
              <EntryRow item={item} isMe={item.user_id === myRank?.user_id} />
            )}
            ListEmptyComponent={<Text style={s.empty}>No data yet. Start studying!</Text>}
          />
        )
      }
    </View>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  myRankBanner: { backgroundColor: colors.primary, padding: spacing.sm },
  myRankText:   { color: '#fff', textAlign: 'center', fontWeight: '600' },
  tabs:         { flexDirection: 'row', backgroundColor: colors.surface, elevation: 2 },
  tab:          { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  activeTab:    { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText:      { ...typography.body, color: colors.textSecondary },
  activeTabText:{ color: colors.primary, fontWeight: '700' },
  row:          { flexDirection: 'row', alignItems: 'center', padding: spacing.md,
                  borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  meRow:        { backgroundColor: '#EFF5FF' },
  rank:         { width: 40, fontSize: 18 },
  name:         { flex: 1, ...typography.body, color: colors.text },
  xp:           { ...typography.body, color: colors.primary, fontWeight: '600' },
  empty:        { textAlign: 'center', padding: 32, color: colors.textSecondary },
});
