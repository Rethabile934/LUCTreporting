import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Platform
} from 'react-native';
import {
  collection, getDocs, addDoc, orderBy, query
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function PRLReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchReports(); }, []);

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

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'reports'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const fbSnap = await getDocs(collection(db, 'feedback'));
      const fbMap = {};
      fbSnap.docs.forEach(d => { fbMap[d.data().reportId] = d.data().comment; });

      setReports(data.map(r => ({ ...r, existingFeedback: fbMap[r.id] || null })));
      setFiltered(data.map(r => ({ ...r, existingFeedback: fbMap[r.id] || null })));
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const submitFeedback = async (reportId) => {
    const comment = feedback[reportId];
    if (!comment || comment.trim() === '') {
      if (Platform.OS === 'web') {
        window.alert('Please enter feedback before submitting.');
      } else {
        Alert.alert('Empty', 'Please enter feedback before submitting.');
      }
      return;
    }
    try {
      await addDoc(collection(db, 'feedback'), {
        reportId,
        comment,
        prlId: user.uid,
        createdAt: new Date().toISOString()
      });
      if (Platform.OS === 'web') {
        window.alert('Feedback submitted!');
      } else {
        Alert.alert('Success', 'Feedback submitted!');
      }
      setFeedback(prev => ({ ...prev, [reportId]: '' }));
      fetchReports();
    } catch (e) {
      if (Platform.OS === 'web') {
        window.alert(e.message);
      } else {
        Alert.alert('Error', e.message);
      }
    }
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
        placeholder="Search by course, lecturer or topic..."
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
            <TouchableOpacity onPress={() => setExpanded(expanded === item.id ? null : item.id)}>
              <View style={styles.cardHeader}>
                <Text style={styles.course}>{item.courseName}</Text>
                <Text style={styles.week}>{item.weekOfReporting}</Text>
              </View>
              <Text style={styles.detail}>👨‍🏫 {item.lecturerName}</Text>
              <Text style={styles.detail}>📚 {item.topicTaught}</Text>
              <Text style={styles.detail}>
                👥 {item.actualStudentsPresent}/{item.totalRegisteredStudents} present
              </Text>
            </TouchableOpacity>

            {expanded === item.id && (
              <View style={styles.expanded}>
                <Text style={styles.expandLabel}>📍 Venue: {item.venue}</Text>
                <Text style={styles.expandLabel}>🕐 Time: {item.scheduledTime}</Text>
                <Text style={styles.expandLabel}>📅 Date: {item.dateOfLecture}</Text>
                <Text style={styles.expandLabel}>Learning Outcomes:</Text>
                <Text style={styles.expandText}>{item.learningOutcomes}</Text>
                <Text style={styles.expandLabel}>Recommendations:</Text>
                <Text style={styles.expandText}>{item.recommendations}</Text>

                {item.existingFeedback ? (
                  <View style={styles.existingFb}>
                    <Text style={styles.existingFbLabel}>✅ Your Feedback:</Text>
                    <Text style={styles.existingFbText}>{item.existingFeedback}</Text>
                  </View>
                ) : (
                  <View style={styles.feedbackBox}>
                    <Text style={styles.feedbackLabel}>Add Feedback:</Text>
                    <TextInput
                      style={styles.feedbackInput}
                      placeholder="Write your feedback here..."
                      placeholderTextColor="#aaa"
                      multiline
                      numberOfLines={3}
                      value={feedback[item.id] || ''}
                      onChangeText={v => setFeedback(prev => ({ ...prev, [item.id]: v }))}
                    />
                    <TouchableOpacity
                      style={styles.fbBtn}
                      onPress={() => submitFeedback(item.id)}
                    >
                      <Text style={styles.fbBtnText}>Submit Feedback</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  week: { fontSize: 12, color: '#27ae60', fontWeight: '600' },
  detail: { fontSize: 13, color: '#555', marginBottom: 4 },
  expanded: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  expandLabel: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 2 },
  expandText: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  existingFb: { backgroundColor: '#e8f8f0', borderRadius: 8, padding: 10, marginTop: 8 },
  existingFbLabel: { fontSize: 12, fontWeight: '700', color: '#27ae60', marginBottom: 4 },
  existingFbText: { fontSize: 13, color: '#333' },
  feedbackBox: { marginTop: 8 },
  feedbackLabel: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6 },
  feedbackInput: {
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: '#222', textAlignVertical: 'top', minHeight: 80
  },
  fbBtn: {
    backgroundColor: '#27ae60', borderRadius: 8, paddingVertical: 10,
    alignItems: 'center', marginTop: 8
  },
  fbBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }
});