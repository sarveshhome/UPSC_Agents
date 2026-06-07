import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', loading, disabled, style }) => {
  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'outline' && styles.outline,
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
        : <Text style={[styles.btnText, variant !== 'primary' && styles.textAlt]}>{title}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  btnText: { ...typography.body, color: '#fff', fontWeight: '600' as const },
  textAlt: { color: colors.primary },
});
