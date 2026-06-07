import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import {
  useGetCommunityFeedQuery,
  useCreatePostMutation,
  useToggleLikeMutation,
  useInviteFriendMutation,
} from '../../../store/api';
import type { CommunityPost } from '../../../types';
import { colors, spacing, typography } from '../../../shared/theme';

const POST_TYPE_ICON: Record<string, string> = {
  achievement: '🏅', milestone: '🎯', invite: '🎉', general: '💬',
};

const PostCard: React.FC<{ post: CommunityPost; onLike: () => void }> = ({ post, onLike }) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <Text style={s.avatar}>{post.username[0]?.toUpperCase()}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.username}>{post.username}</Text>
        <Text style={s.timestamp}>{new Date(post.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={{ fontSize: 18 }}>{POST_TYPE_ICON[post.post_type]}</Text>
    </View>
    <Text style={s.content}>{post.content}</Text>
    <TouchableOpacity style={s.likeRow} onPress={onLike}>
      <Text style={[s.likeBtn, post.liked_by_me && { color: colors.primary }]}>
        {post.liked_by_me ? '❤️' : '🤍'} {post.likes}
      </Text>
    </TouchableOpacity>
  </View>
);

export const CommunityScreen: React.FC = () => {
  const [text, setText] = useState('');
  const { data: feed, isLoading, refetch } = useGetCommunityFeedQuery({ page: 0 });
  const [createPost, { isLoading: posting }] = useCreatePostMutation();
  const [toggleLike] = useToggleLikeMutation();
  const [inviteFriend, { isLoading: inviting }] = useInviteFriendMutation();

  const handlePost = async () => {
    if (!text.trim()) return;
    await createPost({ content: text.trim(), post_type: 'general' });
    setText('');
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        {/* Invite Banner */}
        <View style={s.inviteBanner}>
          <Text style={s.inviteText}>Invite friends & earn 50 XP! 🎁</Text>
          <TouchableOpacity style={s.inviteBtn} onPress={() => inviteFriend()} disabled={inviting}>
            <Text style={s.inviteBtnText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Compose */}
        <View style={s.compose}>
          <TextInput
            style={s.input}
            placeholder="Share something with the community..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={s.postBtn} onPress={handlePost} disabled={posting}>
            <Text style={s.postBtnText}>{posting ? '...' : 'Post'}</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <FlatList
          data={feed ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} onLike={() => toggleLike(item.id)} />
          )}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={<Text style={s.empty}>No posts yet. Be the first!</Text>}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  inviteBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary,
                  padding: spacing.sm, paddingHorizontal: spacing.md },
  inviteText:   { flex: 1, color: '#fff', fontWeight: '600' },
  inviteBtn:    { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  inviteBtnText:{ color: colors.secondary, fontWeight: '700' },
  compose:      { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.sm,
                  borderBottomWidth: 1, borderBottomColor: colors.border },
  input:        { flex: 1, ...typography.body, color: colors.text, minHeight: 36, paddingHorizontal: 8 },
  postBtn:      { backgroundColor: colors.primary, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  postBtnText:  { color: '#fff', fontWeight: '700' },
  card:         { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginTop: spacing.sm,
                  borderRadius: 12, padding: spacing.md, elevation: 1 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
                  textAlign: 'center', lineHeight: 36, color: '#fff', fontWeight: '700' },
  username:     { ...typography.body, fontWeight: '600', color: colors.text },
  timestamp:    { ...typography.caption, color: colors.textSecondary },
  content:      { ...typography.body, color: colors.text, marginBottom: spacing.sm },
  likeRow:      { alignItems: 'flex-start' },
  likeBtn:      { fontSize: 16, color: colors.textSecondary },
  empty:        { textAlign: 'center', padding: 32, color: colors.textSecondary },
});
