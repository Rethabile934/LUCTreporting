import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import PRLDashboard from '../screens/prl/PRLDashboard';
import PRLReportsScreen from '../screens/prl/PRLReportsScreen';
import PRLCoursesScreen from '../screens/prl/PRLCoursesScreen';
import PRLMonitoringScreen from '../screens/prl/PRLMonitoringScreen';
import PRLRatingScreen from '../screens/prl/PRLRatingScreen';

const Tab = createBottomTabNavigator();

const icon = (name) => () => (
  <Text style={{ fontSize: 20 }}>
    {name === 'Home' ? '🏠'
      : name === 'Reports' ? '📝'
      : name === 'Courses' ? '📚'
      : name === 'Monitoring' ? '📊'
      : '⭐'}
  </Text>
);

export default function PRLNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#4A90D9',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { paddingBottom: 6, height: 60 }
      }}
    >
      <Tab.Screen name="Home" component={PRLDashboard}
        options={{ title: 'Dashboard', tabBarIcon: icon('Home') }} />
      <Tab.Screen name="Reports" component={PRLReportsScreen}
        options={{ title: 'Reports', tabBarIcon: icon('Reports') }} />
      <Tab.Screen name="Courses" component={PRLCoursesScreen}
        options={{ title: 'Courses', tabBarIcon: icon('Courses') }} />
      <Tab.Screen name="Monitoring" component={PRLMonitoringScreen}
        options={{ title: 'Monitoring', tabBarIcon: icon('Monitoring') }} />
      <Tab.Screen name="Rating" component={PRLRatingScreen}
        options={{ title: 'Rating', tabBarIcon: icon('Rating') }} />
    </Tab.Navigator>
  );
}