import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PRLMonitoringScreen() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(data);
      setFiltered(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(reports);
    } else {
      const q = search.toLowerCase();
      setFiltered(reports.filter(r =>
        r.courseName?.toLowerCase().includes(q) ||
        r.lecturerName?.toLowerCase().includes(q) ||
        r.venue?.toLowerCase().includes(q)
      ));
    }
  }, [search, reports]);

  const getRate = (present, total) => {
    if (!present || !total) return 0;
    return Math.round((parseInt(present) / parseInt(total)) * 100);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#27ae60" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by course, lecturer or venue..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No data found.</Text>}
        renderItem={({ item }) => {
          const rate = getRate(item.actualStudentsPresent, item.totalRegisteredStudents);
          const color = rate >= 75 ? '#27ae60' : rate >= 50 ? '#f39c12' : '#e74c3c';
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.course}>{item.courseName}</Text>
                  <Text style={styles.sub}> {item.lecturerName} · {item.weekOfReporting}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{rate}%</Text>
                </View>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${rate}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.detail}> {item.venue} · {item.scheduledTime}</Text>
              <Text style={styles.detail}>
                👥 {item.actualStudentsPresent} of {item.totalRegisteredStudents} present
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#ddd', color: '#222'
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 3
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  course: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  barBg: { height: 8, backgroundColor: '#eee', borderRadius: 4, marginBottom: 8 },
  barFill: { height: 8, borderRadius: 4 },
  detail: { fontSize: 13, color: '#666', marginBottom: 3 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});