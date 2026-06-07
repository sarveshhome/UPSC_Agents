import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing, typography } from '../../../shared/theme';
import { useLoginMutation } from '../../../store/api';
import { setCredentials } from '../slice/authSlice';
import type { AuthStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      const result = await login(data).unwrap();
      if (!result.success || !result.token) {
        Alert.alert('Login Failed', result.message);
        return;
      }
      dispatch(setCredentials({ token: result.token, username: data.username }));
    } catch {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>UPSC Master</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <Controller control={control} name="username"
        rules={{ required: 'Username is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Username" value={value} onChangeText={onChange}
            autoCapitalize="none" error={errors.username?.message} />
        )} />
      <Controller control={control} name="password"
        rules={{ required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } }}
        render={({ field: { onChange, value } }) => (
          <Input label="Password" value={value} onChangeText={onChange}
            secureTextEntry error={errors.password?.message} />
        )} />

      <Button title="Login" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      <Button title="Forgot Password?" variant="text"
        onPress={() => navigation.navigate('ForgotPassword')} style={styles.link} />
      <Button title="Create Account" variant="outline"
        onPress={() => navigation.navigate('Register')} style={styles.register} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  link: { marginTop: spacing.sm },
  register: { marginTop: spacing.sm },
});
