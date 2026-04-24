import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import LecturerNavigator from './LecturerNavigator';
import PRLNavigator from './PRLNavigator';
import PLNavigator from './PLNavigator';

export default function AppNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (role === 'student') return <StudentNavigator />;
  if (role === 'lecturer') return <LecturerNavigator />;
  if (role === 'prl') return <PRLNavigator />;
  if (role === 'pl') return <PLNavigator />;

  return <AuthNavigator />;
}