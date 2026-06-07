import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DailyCurrentAffairsScreen } from '../features/currentAffairs/screens/DailyCurrentAffairsScreen';
import { MonthlyCompilationScreen } from '../features/currentAffairs/screens/MonthlyCompilationScreen';
import { CAQuizScreen } from '../features/currentAffairs/screens/CAQuizScreen';
import { colors } from '../shared/theme';
import type { CurrentAffairsStackParamList } from '../types';

const Stack = createNativeStackNavigator<CurrentAffairsStackParamList>();
const header = { headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' };

export const CurrentAffairsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={header}>
    <Stack.Screen name="DailyFeed" component={DailyCurrentAffairsScreen} options={{ title: 'Current Affairs' }} />
    <Stack.Screen name="MonthlyCompilation" component={MonthlyCompilationScreen} options={{ title: 'Monthly Compilation' }} />
    <Stack.Screen name="CAQuiz" component={CAQuizScreen} options={{ title: 'CA Quiz' }} />
  </Stack.Navigator>
);
