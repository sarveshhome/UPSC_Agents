import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing, typography } from '../../../shared/theme';
import { useRegisterMutation } from '../../../store/api';
import type { AuthStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [register, { isLoading }] = useRegisterMutation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', username: '', password: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      const result = await register(data).unwrap();
      if (!result.success) {
        Alert.alert('Registration Failed', result.message);
        return;
      }
      Alert.alert('Success', 'Account created! Please login.');
      navigation.navigate('Login');
    } catch {
      Alert.alert('Registration Failed', 'Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Controller control={control} name="name" rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Full Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )} />
      <Controller control={control} name="username" rules={{ required: 'Username is required' }}
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

      <Button title="Register" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      <Button title="Already have an account? Login" variant="text"
        onPress={() => navigation.goBack()} style={styles.link} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.primary, textAlign: 'center', marginBottom: spacing.xl },
  link: { marginTop: spacing.sm },
});
