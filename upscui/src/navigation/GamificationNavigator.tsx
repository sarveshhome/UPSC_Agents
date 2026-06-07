import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { GamificationScreen }  from '../features/gamification/screens/GamificationScreen';
import { LeaderboardScreen }   from '../features/leaderboard/screens/LeaderboardScreen';
import { CommunityScreen }     from '../features/community/screens/CommunityScreen';
import { colors } from '../shared/theme';
import type { GamificationTabParamList } from '../types';

const Tab = createMaterialTopTabNavigator<GamificationTabParamList>();

export const GamificationNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor:   colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarIndicatorStyle:    { backgroundColor: colors.primary },
      tabBarStyle:             { backgroundColor: colors.surface },
    }}>
    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: '🏆 Ranks' }} />
    <Tab.Screen name="Badges"      component={GamificationScreen} options={{ tabBarLabel: '⚡ XP & Badges' }} />
    <Tab.Screen name="Community"   component={CommunityScreen}   options={{ tabBarLabel: '💬 Community' }} />
  </Tab.Navigator>
);
