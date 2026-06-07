import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useGetGamificationProfileQuery, useGetAllBadgesQuery } from '../../../store/api';
import { clearBadgeAlert } from '../slice/gamificationSlice';
import type { RootState } from '../../../store';
import { colors, spacing, typography } from '../../../shared/theme';

const XPBar: React.FC<{ current: number; next: number; level: number }> = ({ current, next, level }) => {
  const pct = Math.min((current / next) * 100, 100);
  return (
    <View style={s.xpContainer}>
      <Text style={s.levelBadge}>Lv {level}</Text>
      <View style={s.xpBarBg}>
        <View style={[s.xpBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.xpText}>{current} / {next} XP</Text>
    </View>
  );
};

export const GamificationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const badgeAlert = useSelector((s: RootState) => (s as any).gamification?.newBadgeAlert);
  const { data: profile, isLoading } = useGetGamificationProfileQuery();
  const { data: badges } = useGetAllBadgesQuery();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* XP & Level */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>⚡ Your Progress</Text>
        {profile && (
          <XPBar current={profile.total_xp} next={profile.next_level_xp} level={profile.level} />
        )}
      </View>

      {/* Streak */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🔥 Daily Streak</Text>
        <View style={s.row}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{profile?.current_streak ?? 0}</Text>
            <Text style={s.statLabel}>Current</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNum}>{profile?.longest_streak ?? 0}</Text>
            <Text style={s.statLabel}>Longest</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNum}>{profile?.badge_count ?? 0}</Text>
            <Text style={s.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      {/* Badge Wall */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🏅 Badges</Text>
        <View style={s.badgeGrid}>
          {(badges ?? []).map(b => (
            <View key={b.id} style={[s.badgeItem, !b.earned && s.badgeLocked]}>
              <Text style={s.badgeIcon}>{b.icon}</Text>
              <Text style={[s.badgeName, !b.earned && { color: colors.textSecondary }]}>{b.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Badge Earned Modal */}
      <Modal visible={!!badgeAlert} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={{ fontSize: 48 }}>{badgeAlert?.icon}</Text>
            <Text style={s.modalTitle}>Badge Earned!</Text>
            <Text style={s.modalSub}>{badgeAlert?.name}</Text>
            <TouchableOpacity style={s.btn} onPress={() => dispatch(clearBadgeAlert())}>
              <Text style={s.btnText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  card:         { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 12, padding: spacing.md, elevation: 2 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  xpContainer:  { gap: 6 },
  levelBadge:   { ...typography.h2, color: colors.primary, fontWeight: '700' },
  xpBarBg:      { height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden' },
  xpBarFill:    { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  xpText:       { ...typography.caption, color: colors.textSecondary },
  row:          { flexDirection: 'row', justifyContent: 'space-around' },
  statBox:      { alignItems: 'center' },
  statNum:      { fontSize: 28, fontWeight: '700', color: colors.primary },
  statLabel:    { ...typography.caption, color: colors.textSecondary },
  badgeGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeItem:    { width: '28%', alignItems: 'center', padding: spacing.sm, backgroundColor: colors.background, borderRadius: 8 },
  badgeLocked:  { opacity: 0.35 },
  badgeIcon:    { fontSize: 28 },
  badgeName:    { ...typography.caption, color: colors.text, textAlign: 'center', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard:    { backgroundColor: colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  modalTitle:   { ...typography.h2, color: colors.text },
  modalSub:     { ...typography.body, color: colors.textSecondary },
  btn:          { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  btnText:      { color: '#fff', fontWeight: '700' },
});
