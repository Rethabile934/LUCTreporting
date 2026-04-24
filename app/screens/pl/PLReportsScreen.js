import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PLReportsScreen() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(reports);
    } else {
      const q = search.toLowerCase();
      setFiltered(reports.filter(r =>
        r.courseName?.toLowerCase().includes(q) ||
        r.lecturerName?.toLowerCase().includes(q)
      ));
    }
  }, [search, reports]);

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'reports'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const fbSnap = await getDocs(collection(db, 'feedback'));
      const fbMap = {};
      fbSnap.docs.forEach(d => { fbMap[d.data().reportId] = d.data().comment; });

      setReports(reports.map(r => ({ ...r, feedback: fbMap[r.id] || null })));
      setFiltered(reports.map(r => ({ ...r, feedback: fbMap[r.id] || null })));
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#9b59b6" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by course or lecturer..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No reports found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.course}>{item.courseName}</Text>
              <Text style={styles.week}>{item.weekOfReporting}</Text>
            </View>
            <Text style={styles.detail}>👨‍🏫 {item.lecturerName}</Text>
            <Text style={styles.detail}>📚 {item.topicTaught}</Text>
            <Text style={styles.detail}>
              👥 {item.actualStudentsPresent}/{item.totalRegisteredStudents} present
            </Text>
            {item.feedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackLabel}>💬 PRL Feedback:</Text>
                <Text style={styles.feedbackText}>{item.feedback}</Text>
              </View>
            )}
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
  week: { fontSize: 12, color: '#9b59b6', fontWeight: '600' },
  detail: { fontSize: 13, color: '#555', marginBottom: 4 },
  feedbackBox: { backgroundColor: '#f3e8fd', borderRadius: 8, padding: 10, marginTop: 8 },
  feedbackLabel: { fontSize: 12, fontWeight: '700', color: '#9b59b6', marginBottom: 4 },
  feedbackText: { fontSize: 13, color: '#333' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});