import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function ClassesScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(reports);
    } else {
      const q = search.toLowerCase();
      setFiltered(reports.filter(r =>
        r.className?.toLowerCase().includes(q) ||
        r.courseName?.toLowerCase().includes(q) ||
        r.venue?.toLowerCase().includes(q)
      ));
    }
  }, [search, reports]);

  const fetchReports = async () => {
    try {
      const q = query(
        collection(db, 'reports'),
        where('submittedBy', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(data);
      setFiltered(data);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4A90D9" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by class, course or venue..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No classes reported yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.className}>{item.className}</Text>
              <Text style={styles.week}>{item.weekOfReporting}</Text>
            </View>
            <Text style={styles.course}>{item.courseName} · {item.courseCode}</Text>
            <Text style={styles.detail}> {item.venue}</Text>
            <Text style={styles.detail}> {item.scheduledTime}</Text>
            <Text style={styles.detail}> {item.dateOfLecture}</Text>
            <Text style={styles.detail}>
              👥 {item.actualStudentsPresent}/{item.totalRegisteredStudents} present
            </Text>
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
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#222'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  className: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  week: { fontSize: 12, color: '#4A90D9', fontWeight: '600' },
  course: { fontSize: 13, color: '#555', marginBottom: 8, fontWeight: '600' },
  detail: { fontSize: 13, color: '#666', marginBottom: 3 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});