import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import StudentDashboard from '../screens/student/StudentDashboard';
import MonitoringScreen from '../screens/student/MonitoringScreen';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import RatingScreen from '../screens/student/RatingScreen';

const Tab = createBottomTabNavigator();

const icon = (name) => ({ focused }) => (
  <Text style={{ fontSize: 20 }}>
    {name === 'Home' ? '🏠' : name === 'Monitor' ? '📊' : name === 'Attendance' ? '📋' : '⭐'}
  </Text>
);

export default function StudentNavigator() {
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
      <Tab.Screen
        name="Home"
        component={StudentDashboard}
        options={{ title: 'Dashboard', tabBarIcon: icon('Home') }}
      />
      <Tab.Screen
        name="Monitor"
        component={MonitoringScreen}
        options={{ title: 'Monitoring', tabBarIcon: icon('Monitor') }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'Attendance', tabBarIcon: icon('Attendance') }}
      />
      <Tab.Screen
        name="Rating"
        component={RatingScreen}
        options={{ title: 'Rating', tabBarIcon: icon('Rating') }}
      />
    </Tab.Navigator>
  );
}