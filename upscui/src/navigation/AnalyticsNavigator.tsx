import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AnalyticsDashboardScreen } from '../features/analytics/screens/AnalyticsDashboardScreen';
import { WeeklyReportScreen } from '../features/analytics/screens/WeeklyReportScreen';
import { MonthlyReportScreen } from '../features/analytics/screens/MonthlyReportScreen';
import { colors } from '../shared/theme';
import type { AnalyticsStackParamList } from '../types';

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();
const header = { headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' };

export const AnalyticsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={header}>
    <Stack.Screen name="Dashboard" component={AnalyticsDashboardScreen} options={{ title: 'Analytics' }} />
    <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} options={{ title: 'Weekly Report' }} />
    <Stack.Screen name="MonthlyReport" component={MonthlyReportScreen} options={{ title: 'Monthly Report' }} />
  </Stack.Navigator>
);
