import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LecturerDashboard from '../screens/lecturer/LecturerDashboard';
import ReportFormScreen from '../screens/lecturer/ReportFormScreen';
import ClassesScreen from '../screens/lecturer/ClassesScreen';
import StudentAttendanceScreen from '../screens/lecturer/StudentAttendanceScreen';
import RatingScreen from '../screens/lecturer/LecturerRatingScreen';
import ExportReportScreen from '../screens/lecturer/ExportReportScreen';

const Tab = createBottomTabNavigator();

const icon = (name) => ({ color }) => {
  const icons = {
    Home: 'home',
    Report: 'document-text',
    Classes: 'school',
    Attendance: 'people',
    Rating: 'star',
    Export: 'download'
  };
  return <Ionicons name={icons[name]} size={22} color={color} />;
};
export default function LecturerNavigator() {
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
        component={LecturerDashboard}
        options={{ title: 'Dashboard', tabBarIcon: icon('Home') }}
      />
      <Tab.Screen
        name="Report"
        component={ReportFormScreen}
        options={{ title: 'New Report', tabBarIcon: icon('Report') }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesScreen}
        options={{ title: 'Classes', tabBarIcon: icon('Classes') }}
      />
      <Tab.Screen
        name="Attendance"
        component={StudentAttendanceScreen}
        options={{ title: 'Attendance', tabBarIcon: icon('Attendance') }}
      />
      <Tab.Screen
        name="Rating"
        component={RatingScreen}
        options={{ title: 'My Ratings', tabBarIcon: icon('Rating') }}
      />

      <Tab.Screen
        name="Export"
        component={ExportReportScreen}
        options={{title: 'Export',tabBarIcon: () => <Text style={{ fontSize: 20 }}>📥</Text>}}
      />
    </Tab.Navigator>
  );
}