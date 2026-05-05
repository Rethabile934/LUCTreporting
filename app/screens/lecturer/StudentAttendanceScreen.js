import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function StudentAttendanceScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      where('submittedBy', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
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
        r.className?.toLowerCase().includes(q) ||
        r.weekOfReporting?.toLowerCase().includes(q)
      ));
    }
  }, [search, reports]);

  const getRate = (present, total) => {
    if (!present || !total) return 0;
    return Math.round((parseInt(present) / parseInt(total)) * 100);
  };

  const getColor = (rate) => {
    if (rate >= 75) return '#27ae60';
    if (rate >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const getStatus = (rate) => {
    if (rate >= 75) return '✓ Good';
    if (rate >= 50) return '⚠ Average';
    return '✗ Poor';
  };

  // Calculate overall stats
  const totalStudents = reports.reduce((a, r) =>
    a + parseInt(r.totalRegisteredStudents || 0), 0);
  const totalPresent = reports.reduce((a, r) =>
    a + parseInt(r.actualStudentsPresent || 0), 0);
  const overallRate = totalStudents > 0
    ? Math.round((totalPresent / totalStudents) * 100)
    : 0;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4A90D9" />
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Overall Stats Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerValue}>{reports.length}</Text>
          <Text style={styles.bannerLabel}>Total Lectures</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerValue}>{totalPresent}</Text>
          <Text style={styles.bannerLabel}>Total Present</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={[styles.bannerValue, { color: getColor(overallRate) }]}>
            {overallRate}%
          </Text>
          <Text style={styles.bannerLabel}>Overall Rate</Text>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by course, class or week..."
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
            <Text style={styles.emptyIcon}></Text>
            <Text style={styles.empty}>No attendance records yet.</Text>
            <Text style={styles.emptySub}>
              Submit a report to start tracking attendance.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const rate = getRate(item.actualStudentsPresent, item.totalRegisteredStudents);
          const color = getColor(rate);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName}>{item.courseName}</Text>
                  <Text style={styles.classSub}>
                    {item.className} · {item.weekOfReporting}
                  </Text>
                  <Text style={styles.dateSub}>{item.dateOfLecture}</Text>
                </View>
                <View style={[styles.rateBadge, { backgroundColor: color }]}>
                  <Text style={styles.rateText}>{rate}%</Text>
                </View>
              </View>

              <View style={styles.barBg}>
                <View style={[styles.barFill, {
                  width: `${rate}%`,
                  backgroundColor: color
                }]} />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.actualStudentsPresent}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {parseInt(item.totalRegisteredStudents) - parseInt(item.actualStudentsPresent)}
                  </Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.totalRegisteredStudents}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: color }]}>
                  <Text style={[styles.statusText, { color }]}>
                    {getStatus(rate)}
                  </Text>
                </View>
              </View>
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
  banner: {
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    marginBottom: 4
  },
  bannerItem: { alignItems: 'center' },
  bannerValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4
  },
  bannerLabel: { fontSize: 11, color: '#aaa' },
  bannerDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333'
  },
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
    alignItems: 'flex-start',
    marginBottom: 12
  },
  courseName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  classSub: { fontSize: 12, color: '#4A90D9', marginTop: 2, fontWeight: '600' },
  dateSub: { fontSize: 12, color: '#888', marginTop: 2 },
  rateBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rateText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  barBg: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 12
  },
  barFill: { height: 8, borderRadius: 4 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  statusText: { fontSize: 11, fontWeight: '700' },
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