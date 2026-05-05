import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput, TouchableOpacity,
  Alert, Platform
} from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { apiDeleteReport } from '../../firebase/api';

export default function MyReportsScreen({ navigation }) {
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

  const handleDelete = (reportId) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this report?');
      if (confirmed) deleteReport(reportId);
    } else {
      Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteReport(reportId) }
      ]);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const response = await apiDeleteReport(reportId);
      if (response.message) {
        if (Platform.OS === 'web') {
          window.alert('Report deleted successfully!');
        } else {
          Alert.alert('Success', 'Report deleted successfully!');
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert(response.error || 'Something went wrong');
        } else {
          Alert.alert('Error', response.error || 'Something went wrong');
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleEdit = (report) => {
    navigation.navigate('Report', { report });
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
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.empty}>No reports submitted yet.</Text>
            <Text style={styles.emptySub}>
              Go to New Report tab to submit your first report.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.courseCode}>{item.courseCode}</Text>
              </View>
              <Text style={styles.week}>{item.weekOfReporting}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.detail}>Class: {item.className}</Text>
            <Text style={styles.detail}>Date: {item.dateOfLecture}</Text>
            <Text style={styles.detail}>Venue: {item.venue}</Text>
            <Text style={styles.detail}>Time: {item.scheduledTime}</Text>
            <Text style={styles.detail}>
              Attendance: {item.actualStudentsPresent}/{item.totalRegisteredStudents} students
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: 10
  },
  courseName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  courseCode: { fontSize: 12, color: '#4A90D9', fontWeight: '600', marginTop: 2 },
  week: { fontSize: 12, color: '#888', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },
  detail: { fontSize: 13, color: '#555', marginBottom: 4 },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#e8f0fb',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90D9'
  },
  editBtnText: { color: '#4A90D9', fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#fde8e8',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c'
  },
  deleteBtnText: { color: '#e74c3c', fontWeight: '700', fontSize: 13 },
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