import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { useUpdateProfileMutation } from '../../../store/api';
import { setCredentials, logout } from '../../auth/slice/authSlice';
import type { RootState } from '../../../store';

export const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const [editing, setEditing] = useState(false);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name ?? '', targetYear: String(user?.targetYear ?? '') },
  });

  const onSave = async (data: any) => {
    try {
      const updated = await updateProfile({ name: data.name, targetYear: Number(data.targetYear) }).unwrap();
      dispatch(setCredentials({ token: '', user: updated }));
      setEditing(false);
      Alert.alert('Profile Updated');
    } catch {
      Alert.alert('Update Failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.target}>Target Year: {user?.targetYear}</Text>

      {editing ? (
        <>
          <Controller control={control} name="name" rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Full Name" value={value} onChangeText={onChange} error={errors.name?.message} />
            )} />
          <Controller control={control} name="targetYear" rules={{ required: 'Year required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Target Year" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.targetYear?.message} />
            )} />
          <Button title="Save" onPress={handleSubmit(onSave)} loading={isLoading} />
          <Button title="Cancel" variant="text" onPress={() => setEditing(false)} style={styles.cancel} />
        </>
      ) : (
        <Button title="Edit Profile" variant="outline" onPress={() => setEditing(true)} style={styles.edit} />
      )}

      <Button title="Logout" variant="text" onPress={() => dispatch(logout())} style={styles.logout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, alignItems: 'center', backgroundColor: colors.background },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { ...typography.h1, color: '#fff' },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  target: { ...typography.body, color: colors.primary, fontWeight: '600', marginTop: spacing.xs, marginBottom: spacing.xl },
  edit: { width: '100%' },
  cancel: { marginTop: spacing.sm },
  logout: { marginTop: spacing.xl },
});
