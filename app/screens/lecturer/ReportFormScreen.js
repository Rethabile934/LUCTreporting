import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import { apiSubmitReport, apiUpdateReport } from '../../firebase/api';

export default function ReportFormScreen({ route }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const existingReport = route?.params?.report || null;
  const isEditing = !!existingReport;

  const [form, setForm] = useState({
    facultyName: existingReport?.facultyName || '',
    className: existingReport?.className || '',
    weekOfReporting: existingReport?.weekOfReporting || '',
    dateOfLecture: existingReport?.dateOfLecture || '',
    courseName: existingReport?.courseName || '',
    courseCode: existingReport?.courseCode || '',
    lecturerName: existingReport?.lecturerName || '',
    actualStudentsPresent: existingReport?.actualStudentsPresent || '',
    totalRegisteredStudents: existingReport?.totalRegisteredStudents || '',
    venue: existingReport?.venue || '',
    scheduledTime: existingReport?.scheduledTime || '',
    topicTaught: existingReport?.topicTaught || '',
    learningOutcomes: existingReport?.learningOutcomes || '',
    recommendations: existingReport?.recommendations || ''
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = async () => {
    const empty = Object.entries(form).find(([_, v]) => v.trim() === '');
    if (empty) {
      showAlert('Missing Field', `Please fill in: ${empty[0]}`);
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        
        const response = await apiUpdateReport(existingReport.id, form);
        if (response.message) {
          showAlert('Success', 'Report updated successfully!');
        } else {
          showAlert('Error', response.error || 'Something went wrong');
        }
      } else {
        const response = await apiSubmitReport(form);
        if (response.reportId) {
          showAlert('Success', 'Report submitted successfully!');
          setForm({
            facultyName: '', className: '', weekOfReporting: '',
            dateOfLecture: '', courseName: '', courseCode: '',
            lecturerName: '', actualStudentsPresent: '',
            totalRegisteredStudents: '', venue: '', scheduledTime: '',
            topicTaught: '', learningOutcomes: '', recommendations: ''
          });
        } else {
          showAlert('Error', response.error || 'Something went wrong');
        }
      }
    } catch (error) {
      showAlert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isEditing ? 'Edit Report' : 'Lecturer Report Form'}
      </Text>

      {isEditing && (
        <View style={styles.editBanner}>
          <Text style={styles.editBannerText}>
            You are editing an existing report
          </Text>
        </View>
      )}

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

      <TouchableOpacity
        style={[styles.button, isEditing && styles.editButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>
              {isEditing ? 'Update Report' : 'Submit Report'}
            </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
  editBanner: {
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12'
  },
  editBannerText: { fontSize: 13, color: '#b7770d', fontWeight: '600' },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  editButton: { backgroundColor: '#27ae60' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});