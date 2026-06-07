import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DailyQuestionsScreen } from '../features/home/screens/DailyQuestionsScreen';
import { AnswerResultScreen } from '../features/home/screens/AnswerResultScreen';
import { ExplanationScreen } from '../features/home/screens/ExplanationScreen';
import { colors } from '../shared/theme';
import type { HomeStackParamList } from '../types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}>
    <Stack.Screen name="DailyQuestions" component={DailyQuestionsScreen} options={{ title: 'Today\'s Question' }} />
    <Stack.Screen name="AnswerResult" component={AnswerResultScreen} options={{ title: 'Result' }} />
    <Stack.Screen name="Explanation" component={ExplanationScreen} options={{ title: 'Explanation' }} />
  </Stack.Navigator>
);
