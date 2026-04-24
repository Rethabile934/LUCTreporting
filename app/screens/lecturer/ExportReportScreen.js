import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function ExportReportScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [exported, setExported] = useState(false);

  const fetchAndExport = async () => {
    setLoading(true);
    setExported(false);
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const data = snap.docs
        .map(d => d.data())
        .filter(r => r.submittedBy === user.uid)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      if (data.length === 0) {
        window.alert('No reports found to export.');
        setLoading(false);
        return;
      }

      setPreview(data.slice(0, 3));

      const rows = data.map(r => ({
        'Faculty Name': r.facultyName,
        'Class Name': r.className,
        'Week': r.weekOfReporting,
        'Date': r.dateOfLecture,
        'Course Name': r.courseName,
        'Course Code': r.courseCode,
        'Lecturer': r.lecturerName,
        'Students Present': r.actualStudentsPresent,
        'Total Registered': r.totalRegisteredStudents,
        'Attendance %': r.totalRegisteredStudents > 0
          ? Math.round((parseInt(r.actualStudentsPresent) / parseInt(r.totalRegisteredStudents)) * 100) + '%'
          : 'N/A',
        'Venue': r.venue,
        'Scheduled Time': r.scheduledTime,
        'Topic Taught': r.topicTaught,
        'Learning Outcomes': r.learningOutcomes,
        'Recommendations': r.recommendations,
        'Submitted At': r.submittedAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lecture Reports');
      worksheet['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 14 },
        { wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
        { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
        { wch: 30 }, { wch: 35 }, { wch: 30 }, { wch: 22 }
      ];
      XLSX.writeFile(workbook, 'LUCT_Lecture_Reports.xlsx');
      setExported(true);

    } catch (e) {
      console.log(e);
      window.alert('Export failed: ' + e.message);
    }
    setLoading(false);
  };

  const fetchAllAndExport = async () => {
    setLoading(true);
    setExported(false);
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const data = snap.docs
        .map(d => d.data())
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      if (data.length === 0) {
        window.alert('No reports found.');
        setLoading(false);
        return;
      }

      const rows = data.map(r => ({
        'Faculty Name': r.facultyName,
        'Class Name': r.className,
        'Week': r.weekOfReporting,
        'Date': r.dateOfLecture,
        'Course Name': r.courseName,
        'Course Code': r.courseCode,
        'Lecturer': r.lecturerName,
        'Students Present': r.actualStudentsPresent,
        'Total Registered': r.totalRegisteredStudents,
        'Attendance %': r.totalRegisteredStudents > 0
          ? Math.round((parseInt(r.actualStudentsPresent) / parseInt(r.totalRegisteredStudents)) * 100) + '%'
          : 'N/A',
        'Venue': r.venue,
        'Scheduled Time': r.scheduledTime,
        'Topic Taught': r.topicTaught,
        'Learning Outcomes': r.learningOutcomes,
        'Recommendations': r.recommendations,
        'Submitted At': r.submittedAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Reports');
      worksheet['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 14 },
        { wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
        { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
        { wch: 30 }, { wch: 35 }, { wch: 30 }, { wch: 22 }
      ];
      XLSX.writeFile(workbook, 'LUCT_All_Reports.xlsx');
      setExported(true);

    } catch (e) {
      console.log(e);
      window.alert('Export failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📊 Export Reports</Text>
      <Text style={styles.subtitle}>Download lecture reports as Excel files</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 My Reports</Text>
        <Text style={styles.cardDesc}>
          Export all reports submitted by you in Excel format.
        </Text>
        <TouchableOpacity style={styles.button} onPress={fetchAndExport} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>⬇ Download My Reports</Text>
          }
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏫 All Faculty Reports</Text>
        <Text style={styles.cardDesc}>
          Export all reports from all lecturers across the faculty.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#27ae60' }]}
          onPress={fetchAllAndExport}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>⬇ Download All Reports</Text>
          }
        </TouchableOpacity>
      </View>

      {exported && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✅ File downloaded! Check your Downloads folder.
          </Text>
        </View>
      )}

      {preview.length > 0 && (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Preview (last 3 reports)</Text>
          {preview.map((item, index) => (
            <View key={index} style={styles.previewCard}>
              <Text style={styles.previewCourse}>{item.courseName}</Text>
              <Text style={styles.previewDetail}>📅 {item.dateOfLecture} · {item.weekOfReporting}</Text>
              <Text style={styles.previewDetail}>👥 {item.actualStudentsPresent}/{item.totalRegisteredStudents} students</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 20,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 3
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 20 },
  button: { backgroundColor: '#4A90D9', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  successBox: {
    backgroundColor: '#e8f8f0', borderRadius: 10,
    padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#27ae60'
  },
  successText: { color: '#27ae60', fontWeight: '600', fontSize: 14 },
  previewBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  previewTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  previewCard: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 10 },
  previewCourse: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  previewDetail: { fontSize: 12, color: '#888' }
});