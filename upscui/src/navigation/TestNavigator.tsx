import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TestHomeScreen } from '../features/test/screens/TestHomeScreen';
import { MockTestScreen } from '../features/test/screens/MockTestScreen';
import { TestResultScreen } from '../features/test/screens/TestResultScreen';
import { colors } from '../shared/theme';
import type { TestStackParamList } from '../types';

const Stack = createNativeStackNavigator<TestStackParamList>();

export const TestNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="TestHome" component={TestHomeScreen} options={{ title: 'Assessment' }} />
    <Stack.Screen name="MockTest" component={MockTestScreen} options={{ title: 'Test', headerBackVisible: false }} />
    <Stack.Screen name="TestResult" component={TestResultScreen} options={{ title: 'Result', headerBackVisible: false }} />
  </Stack.Navigator>
);
