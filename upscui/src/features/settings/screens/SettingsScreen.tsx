import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme';
import { toggleTheme, toggleNotifications } from '../slice/settingsSlice';
import type { RootState } from '../../../store';

export const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { theme, notifications } = useSelector((s: RootState) => s.settings);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Preferences</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Dark Mode</Text>
          <Text style={styles.sub}>Switch to dark theme</Text>
        </View>
        <Switch value={theme === 'dark'} onValueChange={() => dispatch(toggleTheme())}
          trackColor={{ true: colors.primary }} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Notifications</Text>
          <Text style={styles.sub}>Daily question reminders</Text>
        </View>
        <Switch value={notifications} onValueChange={() => dispatch(toggleNotifications())}
          trackColor={{ true: colors.primary }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  heading: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  label: { ...typography.body, color: colors.text, fontWeight: '600' },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
});
