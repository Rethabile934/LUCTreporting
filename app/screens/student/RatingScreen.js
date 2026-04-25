import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput
} from 'react-native';
import {
  collection, getDocs, addDoc, query,
  where, orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function RatingScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(reports);
    } else {
      const q = search.toLowerCase();
      setFiltered(reports.filter(r =>
        r.lecturerName?.toLowerCase().includes(q) ||
        r.courseName?.toLowerCase().includes(q)
      ));
    }
  }, [search, reports]);

  const fetchData = async () => {
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(data);
      setFiltered(data);

      const rSnap = await getDocs(
        query(collection(db, 'ratings'), where('studentId', '==', user.uid))
      );
      const rMap = {};
      rSnap.docs.forEach(d => { rMap[d.data().reportId] = d.data().rating; });
      setRatings(rMap);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const submitRating = async (reportId, rating) => {
    try {
      await addDoc(collection(db, 'ratings'), {
        reportId,
        studentId: user.uid,
        rating,
        createdAt: new Date().toISOString()
      });
      setRatings(prev => ({ ...prev, [reportId]: rating }));
      Alert.alert('Thanks!', 'Your rating has been submitted.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
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
        placeholder="Search by lecturer or course..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No lectures to rate yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.course}>{item.courseName}</Text>
            <Text style={styles.sub}> {item.lecturerName} · {item.weekOfReporting}</Text>
            <Text style={styles.topic}>{item.topicTaught}</Text>
            {ratings[item.id] ? (
              <View style={styles.ratedRow}>
                <Text style={styles.ratedText}>
                  You rated: {'⭐'.repeat(ratings[item.id])}
                </Text>
              </View>
            ) : (
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => submitRating(item.id, star)}
                  >
                    <Text style={styles.star}>☆</Text>
                  </TouchableOpacity>
                ))}
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
  course: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  sub: { fontSize: 13, color: '#666', marginBottom: 4 },
  topic: { fontSize: 13, color: '#888', marginBottom: 10 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 28, color: '#f39c12' },
  ratedRow: { marginTop: 4 },
  ratedText: { fontSize: 14, color: '#27ae60', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});