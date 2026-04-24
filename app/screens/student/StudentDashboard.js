import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/auth';

export default function StudentDashboard() {
  const { user } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) await logoutUser();
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => await logoutUser() }
      ]);
    }
  };

  const cards = [
    { icon: '📊', label: 'Monitoring', color: '#4A90D9' },
    { icon: '📋', label: 'Attendance', color: '#27ae60' },
    { icon: '⭐', label: 'Rating', color: '#f39c12' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Student 👋</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>LUCT Reporting System</Text>
        <Text style={styles.bannerSub}>Track your attendance and monitor lectures</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.cardsRow}>
        {cards.map((c) => (
          <View key={c.label} style={[styles.card, { borderTopColor: c.color }]}>
            <Text style={styles.cardIcon}>{c.icon}</Text>
            <Text style={styles.cardLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📌 Notice</Text>
        <Text style={styles.infoText}>
          Use the tabs below to monitor your classes, check attendance records,
          and rate your lecturers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  email: { fontSize: 12, color: '#aaa', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  banner: {
    backgroundColor: '#4A90D9',
    margin: 16,
    borderRadius: 14,
    padding: 20
  },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  bannerSub: { fontSize: 13, color: '#d0e8ff', marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 12
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 10
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },
  infoBox: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90D9'
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#666', lineHeight: 20 }
});