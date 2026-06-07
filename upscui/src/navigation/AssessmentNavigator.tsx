import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TestNavigator } from './TestNavigator';
import { SearchScreen } from '../features/search/screens/SearchScreen';
import { BookmarksScreen } from '../features/bookmark/screens/BookmarksScreen';
import { NotesScreen } from '../features/notes/screens/NotesScreen';
import { colors } from '../shared/theme';
import type { AssessmentTabParamList } from '../types';

const Tab = createBottomTabNavigator<AssessmentTabParamList>();
const icon = (emoji: string) => () => <Text style={{ fontSize: 18 }}>{emoji}</Text>;

export const AssessmentNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary, tabBarStyle: { borderTopColor: colors.border } }}>
    <Tab.Screen name="Tests" component={TestNavigator} options={{ tabBarIcon: icon('📝'), tabBarLabel: 'Tests' }} />
    <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: icon('🔍'), tabBarLabel: 'Search', headerShown: true, headerTitle: 'Search', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
    <Tab.Screen name="Bookmarks" component={BookmarksScreen} options={{ tabBarIcon: icon('🔖'), tabBarLabel: 'Saved', headerShown: true, headerTitle: 'Bookmarks', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
    <Tab.Screen name="Notes" component={NotesScreen} options={{ tabBarIcon: icon('📓'), tabBarLabel: 'Notes', headerShown: true, headerTitle: 'My Notes', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
  </Tab.Navigator>
);
