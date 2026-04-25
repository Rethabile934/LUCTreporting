import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function MonitoringScreen() {
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
        r.topicTaught?.toLowerCase().includes(q)
      ));
    }
  }, [search, reports]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4A90D9" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by course, lecturer or topic..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No reports found.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.course}>{item.courseName}</Text>
              <Text style={styles.week}>{item.weekOfReporting}</Text>
            </View>
            <Text style={styles.detail}>{item.lecturerName}</Text>
            <Text style={styles.detail}>{item.topicTaught}</Text>
            <Text style={styles.detail}> {item.venue} · {item.scheduledTime}</Text>
            <Text style={styles.detail}>
              👥 {item.actualStudentsPresent} / {item.totalRegisteredStudents} students
            </Text>
            <View style={styles.divider} />
            <Text style={styles.outcomesLabel}>Learning Outcomes:</Text>
            <Text style={styles.outcomes}>{item.learningOutcomes}</Text>
          </View>
        )}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  course: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', flex: 1 },
  week: { fontSize: 12, color: '#4A90D9', fontWeight: '600' },
  detail: { fontSize: 13, color: '#555', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  outcomesLabel: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 4 },
  outcomes: { fontSize: 13, color: '#666', lineHeight: 18 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});