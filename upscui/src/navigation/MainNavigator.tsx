import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeNavigator } from './HomeNavigator';
import { AssessmentNavigator } from './AssessmentNavigator';
import { AnalyticsNavigator } from './AnalyticsNavigator';
import { CurrentAffairsNavigator } from './CurrentAffairsNavigator';
import { QuestionBankScreen } from '../features/questionBank/screens/QuestionBankScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { colors } from '../shared/theme';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export const MainNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: { borderTopColor: colors.border },
    }}>
    <Tab.Screen name="Home" component={HomeNavigator}
      options={{ tabBarIcon: icon('🏠'), tabBarLabel: 'Home' }} />
    <Tab.Screen name="QuestionBank" component={QuestionBankScreen}
      options={{ tabBarIcon: icon('📚'), tabBarLabel: 'Questions',
        headerShown: true, headerTitle: 'Question Bank',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff' }} />
    <Tab.Screen name="Assessment" component={AssessmentNavigator}
      options={{ tabBarIcon: icon('🎯'), tabBarLabel: 'Assessment' }} />
    <Tab.Screen name="Analytics" component={AnalyticsNavigator}
      options={{ tabBarIcon: icon('📊'), tabBarLabel: 'Analytics' }} />
    <Tab.Screen name="CurrentAffairs" component={CurrentAffairsNavigator}
      options={{ tabBarIcon: icon('📰'), tabBarLabel: 'Current Affairs' }} />
    <Tab.Screen name="Profile" component={ProfileScreen}
      options={{ tabBarIcon: icon('👤'), tabBarLabel: 'Profile',
        headerShown: true, headerTitle: 'My Profile',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff' }} />
    <Tab.Screen name="Settings" component={SettingsScreen}
      options={{ tabBarIcon: icon('⚙️'), tabBarLabel: 'Settings',
        headerShown: true, headerTitle: 'Settings',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff' }} />
  </Tab.Navigator>
);
