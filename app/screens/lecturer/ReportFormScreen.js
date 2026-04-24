import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';

export default function ReportFormScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    facultyName: '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: '',
    courseName: '',
    courseCode: '',
    lecturerName: '',
    actualStudentsPresent: '',
    totalRegisteredStudents: '',
    venue: '',
    scheduledTime: '',
    topicTaught: '',
    learningOutcomes: '',
    recommendations: ''
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const empty = Object.entries(form).find(([_, v]) => v.trim() === '');
    if (empty) {
      Alert.alert('Missing Field', `Please fill in: ${empty[0]}`);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        ...form,
        submittedBy: user.uid,
        submittedAt: new Date().toISOString()
      });
      Alert.alert('Success', 'Report submitted successfully!');
      setForm({
        facultyName: '', className: '', weekOfReporting: '',
        dateOfLecture: '', courseName: '', courseCode: '',
        lecturerName: '', actualStudentsPresent: '',
        totalRegisteredStudents: '', venue: '', scheduledTime: '',
        topicTaught: '', learningOutcomes: '', recommendations: ''
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Lecturer Report Form</Text>

      <InputField label="Faculty Name" value={form.facultyName}
        onChangeText={v => update('facultyName', v)} placeholder="e.g. Faculty of ICT" />

      <InputField label="Class Name" value={form.className}
        onChangeText={v => update('className', v)} placeholder="e.g. BIMP2210-A" />

      <InputField label="Week of Reporting" value={form.weekOfReporting}
        onChangeText={v => update('weekOfReporting', v)} placeholder="e.g. Week 6" />

      <InputField label="Date of Lecture" value={form.dateOfLecture}
        onChangeText={v => update('dateOfLecture', v)} placeholder="e.g. 2025-04-23" />

      <InputField label="Course Name" value={form.courseName}
        onChangeText={v => update('courseName', v)} placeholder="e.g. Mobile Device Programming" />

      <InputField label="Course Code" value={form.courseCode}
        onChangeText={v => update('courseCode', v)} placeholder="e.g. BIMP2210" />

      <InputField label="Lecturer's Name" value={form.lecturerName}
        onChangeText={v => update('lecturerName', v)} placeholder="Full name" />

      <InputField label="Actual Students Present" value={form.actualStudentsPresent}
        onChangeText={v => update('actualStudentsPresent', v)}
        placeholder="e.g. 25" keyboardType="numeric" />

      <InputField label="Total Registered Students" value={form.totalRegisteredStudents}
        onChangeText={v => update('totalRegisteredStudents', v)}
        placeholder="e.g. 30" keyboardType="numeric" />

      <InputField label="Venue" value={form.venue}
        onChangeText={v => update('venue', v)} placeholder="e.g. Room 204" />

      <InputField label="Scheduled Lecture Time" value={form.scheduledTime}
        onChangeText={v => update('scheduledTime', v)} placeholder="e.g. 08:00 - 10:00" />

      <InputField label="Topic Taught" value={form.topicTaught}
        onChangeText={v => update('topicTaught', v)}
        placeholder="e.g. React Native Navigation" multiline numberOfLines={2} />

      <InputField label="Learning Outcomes" value={form.learningOutcomes}
        onChangeText={v => update('learningOutcomes', v)}
        placeholder="What students should be able to do..." multiline numberOfLines={3} />

      <InputField label="Lecturer's Recommendations" value={form.recommendations}
        onChangeText={v => update('recommendations', v)}
        placeholder="Any recommendations..." multiline numberOfLines={3} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Submit Report</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  button: {
    backgroundColor: '#4A90D9', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});