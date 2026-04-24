import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/auth';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ reports: 0, students: 0, avgAttendance: 0 });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const q = query(collection(db, 'reports'), where('submittedBy', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data());
      const totalStudents = data.reduce((a, r) => a + parseInt(r.totalRegisteredStudents || 0), 0);
      const totalPresent = data.reduce((a, r) => a + parseInt(r.actualStudentsPresent || 0), 0);
      const avg = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
      setStats({ reports: data.length, students: totalStudents, avgAttendance: avg });
    } catch (e) { console.log(e); }
  };

  const handleLogout = async () => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) await logoutUser();
  } else {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logoutUser() }
    ]);
  }
};

  const statCards = [
    { label: 'Reports Submitted', value: stats.reports, icon: '📝', color: '#4A90D9' },
    { label: 'Total Students', value: stats.students, icon: '👥', color: '#27ae60' },
    { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: '📊', color: '#f39c12' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Lecturer</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>LUCT Reporting System</Text>
        <Text style={styles.bannerSub}>Submit and manage your lecture reports</Text>
      </View>

      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsRow}>
        {statCards.map(s => (
          <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}> Quick Tips</Text>
        <Text style={styles.infoText}>• Use the 📝 tab to submit a new lecture report{'\n'}
- Check 📋 to view student attendance records{'\n'}
- See ⭐ to view your ratings from students</Text>
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
    fontSize: 16, fontWeight: '700',
    color: '#1a1a2e', marginHorizontal: 16, marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  infoBox: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90D9'
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#666', lineHeight: 22 }
});