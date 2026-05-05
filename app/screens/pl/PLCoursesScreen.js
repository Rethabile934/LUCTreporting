import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Platform, Modal,
  ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import {
  apiGetCourses, apiCreateCourse,
  apiUpdateCourse, apiDeleteCourse
} from '../../firebase/api';

export default function PLCoursesScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    courseName: '',
    courseCode: '',
    facultyName: '',
    assignedTo: ''
  });

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(courses);
    } else {
      const q = search.toLowerCase();
      setFiltered(courses.filter(c =>
        c.courseName?.toLowerCase().includes(q) ||
        c.courseCode?.toLowerCase().includes(q) ||
        c.assignedTo?.toLowerCase().includes(q)
      ));
    }
  }, [search, courses]);

  const fetchCourses = async () => {
    try {
      const data = await apiGetCourses();
      setCourses(data);
      setFiltered(data);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm({ courseName: '', courseCode: '', facultyName: '', assignedTo: '' });
    setShowForm(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setForm({
      courseName: course.courseName || '',
      courseCode: course.courseCode || '',
      facultyName: course.facultyName || '',
      assignedTo: course.assignedTo || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.courseName || !form.courseCode) {
      showAlert('Missing Fields', 'Please fill in course name and code.');
      return;
    }

    try {
      if (editingCourse) {
        const response = await apiUpdateCourse(editingCourse.id, form);
        if (response.message) {
          showAlert('Success', 'Course updated successfully!');
          setShowForm(false);
          fetchCourses();
        } else {
          showAlert('Error', response.error || 'Something went wrong');
        }
      } else {
        const response = await apiCreateCourse(form);
        if (response.courseId) {
          showAlert('Success', 'Course added successfully!');
          setShowForm(false);
          fetchCourses();
        } else {
          showAlert('Error', response.error || 'Something went wrong');
        }
      }
    } catch (e) {
      showAlert('Error', e.message);
    }
  };

  const handleDelete = (courseId, courseName) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete "${courseName}"?`);
      if (confirmed) deleteCourse(courseId);
    } else {
      Alert.alert('Delete Course', `Are you sure you want to delete "${courseName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCourse(courseId) }
      ]);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const response = await apiDeleteCourse(courseId);
      if (response.message) {
        showAlert('Success', 'Course deleted successfully!');
        fetchCourses();
      } else {
        showAlert('Error', response.error || 'Something went wrong');
      }
    } catch (e) {
      showAlert('Error', e.message);
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
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

   
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </Text>

            <ScrollView>
              <InputField
                label="Course Name"
                value={form.courseName}
                onChangeText={v => setForm(p => ({ ...p, courseName: v }))}
                placeholder="e.g. Mobile Device Programming"
              />
              <InputField
                label="Course Code"
                value={form.courseCode}
                onChangeText={v => setForm(p => ({ ...p, courseCode: v }))}
                placeholder="e.g. BIMP2210"
              />
              <InputField
                label="Faculty Name"
                value={form.facultyName}
                onChangeText={v => setForm(p => ({ ...p, facultyName: v }))}
                placeholder="e.g. Faculty of ICT"
              />
              <InputField
                label="Assign to Lecturer (email)"
                value={form.assignedTo}
                onChangeText={v => setForm(p => ({ ...p, assignedTo: v }))}
                placeholder="lecturer@limkokwing.ac.ls"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, editingCourse && styles.updateBtn]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>
                  {editingCourse ? 'Update Course' : 'Save Course'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Courses List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}></Text>
            <Text style={styles.empty}>No courses added yet.</Text>
            <Text style={styles.emptySub}>Tap "+ Add" to add a course.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.courseCode}>{item.courseCode}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {item.facultyName ? (
              <Text style={styles.detail}>Faculty: {item.facultyName}</Text>
            ) : null}
            {item.assignedTo ? (
              <Text style={styles.detail}>Assigned to: {item.assignedTo}</Text>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenEdit(item)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.courseName)}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 0,
    gap: 8
  },
  search: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#222'
  },
  addBtn: {
    backgroundColor: '#9b59b6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  courseName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  courseCode: { fontSize: 12, color: '#9b59b6', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },
  detail: { fontSize: 13, color: '#555', marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editBtn: {
    flex: 1,
    backgroundColor: '#f3e8fd',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9b59b6'
  },
  editBtnText: { color: '#9b59b6', fontWeight: '700', fontSize: 13 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelBtnText: { color: '#555', fontWeight: '700', fontSize: 14 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#9b59b6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  updateBtn: { backgroundColor: '#27ae60' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 16, fontWeight: '700', color: '#555', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' }
});