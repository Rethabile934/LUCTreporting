import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { apiGetLecturers, apiGetReports } from '../../firebase/api';

export default function PLLecturersScreen() {
  const [lecturers, setLecturers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLecturers(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(lecturers);
    } else {
      const q = search.toLowerCase();
      setFiltered(lecturers.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
      ));
    }
  }, [search, lecturers]);

  const fetchLecturers = async () => {
    try {
      const data = await apiGetLecturers();
      const reports = await apiGetReports();

      const merged = data.map(l => ({
        ...l,
        reportCount: reports.filter(r => r.submittedBy === l.uid).length
      }));

      setLecturers(merged);
      setFiltered(merged);
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
        placeholder="Search by name or email..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No lecturers registered yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name ? item.name[0].toUpperCase() : '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.reportCount} reports</Text>
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
    backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#ddd', color: '#222'
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 3
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#9b59b6', justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  email: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { backgroundColor: '#f3e8fd', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#9b59b6', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});