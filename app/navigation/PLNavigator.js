import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import PLDashboard from '../screens/pl/PLDashboard';
import PLCoursesScreen from '../screens/pl/PLCoursesScreen';
import PLReportsScreen from '../screens/pl/PLReportsScreen';
import PLMonitoringScreen from '../screens/pl/PLMonitoringScreen';
import PLLecturersScreen from '../screens/pl/PLLecturersScreen';
import ExportReportScreen from '../screens/lecturer/ExportReportScreen';

const Tab = createBottomTabNavigator();

const icon = (name) => () => (
  <Text style={{ fontSize: 20 }}>
    {name === 'Home' ? '🏠'
      : name === 'Courses' ? '📚'
      : name === 'Reports' ? '📝'
      : name === 'Monitoring' ? '📊'
      : '👨‍🏫'}
  </Text>
);

export default function PLNavigator() {
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
      <Tab.Screen name="Home" component={PLDashboard}
        options={{ title: 'Dashboard', tabBarIcon: icon('Home') }} />
      <Tab.Screen name="Courses" component={PLCoursesScreen}
        options={{ title: 'Courses', tabBarIcon: icon('Courses') }} />
      <Tab.Screen name="Reports" component={PLReportsScreen}
        options={{ title: 'Reports', tabBarIcon: icon('Reports') }} />
      <Tab.Screen name="Monitoring" component={PLMonitoringScreen}
        options={{ title: 'Monitoring', tabBarIcon: icon('Monitoring') }} />
      <Tab.Screen name="Lecturers" component={PLLecturersScreen}
        options={{ title: 'Lecturers', tabBarIcon: icon('Lecturers') }} />

      <Tab.Screen name="Export" component={ExportReportScreen}
        options={{title: 'Export',tabBarIcon: () => <Text style={{ fontSize: 20 }}>📥</Text>}}
      />
    </Tab.Navigator>
  );
}