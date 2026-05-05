import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function ClassesScreen() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(classes);
    } else {
      const q = search.toLowerCase();
      setFiltered(classes.filter(c =>
        c.courseName?.toLowerCase().includes(q) ||
        c.courseCode?.toLowerCase().includes(q) ||
        c.facultyName?.toLowerCase().includes(q)
      ));
    }
  }, [search, classes]);

  const fetchClasses = async () => {
    try {
    
      const q = query(
        collection(db, 'courses'),
        where('assignedTo', '==', user.email)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    
      const reportsSnap = await getDocs(
        query(collection(db, 'reports'), where('submittedBy', '==', user.uid))
      );
      const reports = reportsSnap.docs.map(d => d.data());

      const merged = data.map(course => ({
        ...course,
        reportCount: reports.filter(r =>
          r.courseCode === course.courseCode
        ).length
      }));

      setClasses(merged);
      setFiltered(merged);
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
        placeholder="Search by course, code or faculty..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.empty}>No classes assigned yet.</Text>
            <Text style={styles.emptySub}>
              Your Program Leader hasn't assigned any classes to you yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}></Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.courseCode}>{item.courseCode}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.reportCount} reports</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detail}> {item.facultyName}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge,
                item.reportCount > 0
                  ? styles.statusActive
                  : styles.statusPending
              ]}>
                <Text style={styles.statusText}>
                  {item.reportCount > 0 ? '✓ Reporting Active' : ' No Reports Yet'}
                </Text>
              </View>
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e8f0fb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconText: { fontSize: 22 },
  courseName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  courseCode: { fontSize: 12, color: '#4A90D9', fontWeight: '600', marginTop: 2 },
  badge: {
    backgroundColor: '#e8f0fb',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: { color: '#4A90D9', fontWeight: '700', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },
  detailRow: { marginBottom: 10 },
  detail: { fontSize: 13, color: '#666' },
  statusRow: { flexDirection: 'row' },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  statusActive: { backgroundColor: '#e8f8f0' },
  statusPending: { backgroundColor: '#fff8e8' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#555' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 16, fontWeight: '700', color: '#555', marginBottom: 6 },
  emptySub: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 40
  }
});