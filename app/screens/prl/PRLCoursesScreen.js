import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PRLCoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(courses);
    } else {
      const q = search.toLowerCase();
      setFiltered(courses.filter(c =>
        c.courseName?.toLowerCase().includes(q) ||
        c.courseCode?.toLowerCase().includes(q) ||
        c.lecturerName?.toLowerCase().includes(q)
      ));
    }
  }, [search, courses]);

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const data = snap.docs.map(d => d.data());
      const unique = {};
      data.forEach(r => {
        if (!unique[r.courseCode]) {
          unique[r.courseCode] = {
            courseName: r.courseName,
            courseCode: r.courseCode,
            lecturerName: r.lecturerName,
            facultyName: r.facultyName,
            count: 1
          };
        } else {
          unique[r.courseCode].count++;
        }
      });
      const list = Object.values(unique);
      setCourses(list);
      setFiltered(list);
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
        placeholder="Search by course, code or lecturer..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.courseCode}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No courses found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.code}>{item.courseCode}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count} reports</Text>
              </View>
            </View>
            <Text style={styles.detail}>👨‍🏫 {item.lecturerName}</Text>
            <Text style={styles.detail}>🏫 {item.facultyName}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  courseName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  code: { fontSize: 12, color: '#27ae60', fontWeight: '600', marginTop: 2 },
  badge: { backgroundColor: '#e8f8f0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#27ae60', fontWeight: '700', fontSize: 12 },
  detail: { fontSize: 13, color: '#666', marginBottom: 3 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});