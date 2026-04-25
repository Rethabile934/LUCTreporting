import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Platform
} from 'react-native';
import {
  collection, getDocs, addDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import InputField from '../../components/InputField';

export default function PLCoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseName: '', courseCode: '', facultyName: '', assignedTo: '' });

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(courses);
    } else {
      const q = search.toLowerCase();
      setFiltered(courses.filter(c =>
        c.courseName?.toLowerCase().includes(q) ||
        c.courseCode?.toLowerCase().includes(q)
      ));
    }
  }, [search, courses]);

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourses(data);
      setFiltered(data);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.courseName || !form.courseCode) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in course name and code.');
      } else {
        Alert.alert('Missing Fields', 'Please fill in course name and code.');
      }
      return;
    }
    try {
      await addDoc(collection(db, 'courses'), {
        ...form,
        createdAt: new Date().toISOString()
      });
      setForm({ courseName: '', courseCode: '', facultyName: '', assignedTo: '' });
      setShowForm(false);
      fetchCourses();
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
      <ActivityIndicator size="large" color="#9b59b6" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TextInput
          style={styles.search}
          placeholder="Search courses..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? '✕' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <InputField label="Course Name" value={form.courseName}
            onChangeText={v => setForm(p => ({ ...p, courseName: v }))}
            placeholder="e.g. Mobile Device Programming" />
          <InputField label="Course Code" value={form.courseCode}
            onChangeText={v => setForm(p => ({ ...p, courseCode: v }))}
            placeholder="e.g. BIMP2210" />
          <InputField label="Faculty Name" value={form.facultyName}
            onChangeText={v => setForm(p => ({ ...p, facultyName: v }))}
            placeholder="e.g. Faculty of ICT" />
          <InputField label="Assign to Lecturer (email)" value={form.assignedTo}
            onChangeText={v => setForm(p => ({ ...p, assignedTo: v }))}
            placeholder="lecturer@limkokwing.ac.ls" />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
            <Text style={styles.submitBtnText}>Save Course</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No courses added yet. Tap "+ Add" to add one.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.courseName}>{item.courseName}</Text>
            <Text style={styles.code}>{item.courseCode}</Text>
            {item.facultyName ? <Text style={styles.detail}>{item.facultyName}</Text> : null}
            {item.assignedTo ? <Text style={styles.detail}>{item.assignedTo}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 0, gap: 8 },
  search: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#ddd', color: '#222'
  },
  addBtn: { backgroundColor: '#9b59b6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16 },
  submitBtn: { backgroundColor: '#9b59b6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 3
  },
  courseName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  code: { fontSize: 13, color: '#9b59b6', fontWeight: '600', marginBottom: 6 },
  detail: { fontSize: 13, color: '#666', marginBottom: 3 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15, paddingHorizontal: 20 }
});