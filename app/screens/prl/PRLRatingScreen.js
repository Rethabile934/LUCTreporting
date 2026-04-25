import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PRLRatingScreen() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(data);
    } else {
      const q = search.toLowerCase();
      setFiltered(data.filter(r =>
        r.lecturerName?.toLowerCase().includes(q) ||
        r.courseName?.toLowerCase().includes(q)
      ));
    }
  }, [search, data]);

  const fetchData = async () => {
    try {
      const repSnap = await getDocs(collection(db, 'reports'));
      const reports = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const ratSnap = await getDocs(collection(db, 'ratings'));
      const allRatings = ratSnap.docs.map(d => d.data());

      const merged = reports.map(rep => {
        const repRatings = allRatings.filter(r => r.reportId === rep.id);
        const avg = repRatings.length > 0
          ? (repRatings.reduce((a, r) => a + r.rating, 0) / repRatings.length).toFixed(1)
          : null;
        return { ...rep, avgRating: avg, ratingCount: repRatings.length };
      });

      setData(merged);
      setFiltered(merged);
    } catch (e) { console.log(e); }
    setLoading(false);
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
        placeholder="Search by lecturer or course..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No ratings yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.course}>{item.courseName}</Text>
                <Text style={styles.sub}>{item.lecturerName} · {item.weekOfReporting}</Text>
              </View>
              {item.avgRating ? (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingValue}>⭐ {item.avgRating}</Text>
                  <Text style={styles.ratingCount}>{item.ratingCount} reviews</Text>
                </View>
              ) : (
                <View style={styles.noRating}>
                  <Text style={styles.noRatingText}>No ratings</Text>
                </View>
              )}
            </View>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  course: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
  ratingBadge: { alignItems: 'center' },
  ratingValue: { fontSize: 16, fontWeight: '700', color: '#f39c12' },
  ratingCount: { fontSize: 11, color: '#aaa' },
  noRating: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  noRatingText: { fontSize: 12, color: '#aaa' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});