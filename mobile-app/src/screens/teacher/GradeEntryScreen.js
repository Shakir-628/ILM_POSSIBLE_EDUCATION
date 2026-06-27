import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { teacherService } from '../../services/teacherService';
import { gradeService } from '../../services/gradeService';
import GradientHeader from '../../components/GradientHeader';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';

const GradeEntryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: { marksObtained, totalMarks, remarks } }
  const [examType, setExamType] = useState('Final Exam');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getMyClasses();
      setClasses(data);
      if (data.length > 0) {
        handleSelectClass(data[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Error', 'Failed to load classes');
      setLoading(false);
    }
  };

  const handleSelectClass = async (classData) => {
    setSelectedClass(classData);
    setSubjects(classData.subjects || []);
    if (classData.subjects?.length > 0) {
      setSelectedSubject(classData.subjects[0]);
    }
    
    setLoading(true);
    try {
      const studentData = await teacherService.getClassStudents(classData._id);
      setStudents(studentData);
      
      // Initialize marks
      const initialMarks = {};
      studentData.forEach(student => {
        initialMarks[student._id] = {
          marksObtained: '',
          totalMarks: '100',
          remarks: ''
        };
      });
      setMarks(initialMarks);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const updateMark = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject) {
      Alert.alert('Error', 'Please select class and subject');
      return;
    }

    try {
      setSubmitting(true);
      
      // We submit one by one or we could add a bulk endpoint
      // For simplicity and since gradeService has createGrade, we'll do them in a loop or implement bulk
      const promises = students.map(student => {
        const studentMarks = marks[student._id];
        if (!studentMarks.marksObtained) return Promise.resolve(); // Skip empty

        return gradeService.createGrade({
          student: student._id,
          classId: selectedClass._id,
          subject: selectedSubject._id,
          marksObtained: parseFloat(studentMarks.marksObtained),
          totalMarks: parseFloat(studentMarks.totalMarks),
          examType,
          term: 'Annual', // Default
          remarks: studentMarks.remarks
        });
      });

      await Promise.all(promises);

      Alert.alert('Success', 'Grades submitted successfully');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error submitting grades:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }) => {
    const studentMarks = marks[item._id] || {};

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.studentId}>ID: {item.studentId}</Text>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Obtained</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={studentMarks.marksObtained}
              onChangeText={(val) => updateMark(item._id, 'marksObtained', val)}
            />
          </View>
          <View style={styles.inputDivider}>
            <Text style={styles.dividerText}>/</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Total</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              keyboardType="numeric"
              value={studentMarks.totalMarks}
              onChangeText={(val) => updateMark(item._id, 'totalMarks', val)}
            />
          </View>
        </View>

        <TextInput
          style={styles.remarksInput}
          placeholder="Remarks (optional)"
          value={studentMarks.remarks}
          onChangeText={(val) => updateMark(item._id, 'remarks', val)}
        />
      </View>
    );
  };

  if (loading && !selectedClass) return <Loading message="Loading classes..." />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <GradientHeader title="Grade Entry" />
      
      <View style={styles.selectors}>
        <View style={styles.selectorItem}>
          <Text style={styles.label}>Class:</Text>
          <FlatList
            horizontal
            data={classes}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedClass?._id === item._id && styles.selectedChip
                ]}
                onPress={() => handleSelectClass(item)}
              >
                <Text style={[styles.chipText, selectedClass?._id === item._id && styles.selectedChipText]}>
                  {item.className}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.selectorItem}>
          <Text style={styles.label}>Subject:</Text>
          <FlatList
            horizontal
            data={subjects}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedSubject?._id === item._id && styles.selectedChip
                ]}
                onPress={() => setSelectedSubject(item)}
              >
                <Text style={[styles.chipText, selectedSubject?._id === item._id && styles.selectedChipText]}>
                  {item.subjectName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
      ) : students.length > 0 ? (
        <>
          <FlatList
            data={students}
            keyExtractor={(item) => item._id}
            renderItem={renderStudentItem}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <CustomButton
              title="Submit Grades"
              onPress={handleSubmit}
              loading={submitting}
              icon="save-outline"
            />
          </View>
        </>
      ) : (
        <EmptyState
          icon="school-outline"
          title="No Students"
          message="No students found in this class"
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  selectors: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectorItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
  },
  selectedChipText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeader: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  studentId: {
    fontSize: 12,
    color: '#6b7280',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  inputDivider: {
    paddingHorizontal: 12,
    paddingTop: 15,
  },
  dividerText: {
    fontSize: 20,
    color: '#9ca3af',
  },
  remarksInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});

export default GradeEntryScreen;
