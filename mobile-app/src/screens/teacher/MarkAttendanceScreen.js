import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacherService';
import { attendanceService } from '../../services/attendanceService';
import GradientHeader from '../../components/GradientHeader';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';
import { ATTENDANCE_STATUS } from '../../utils/constants';

const MarkAttendanceScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: status }

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
    setLoading(true);
    try {
      const studentData = await teacherService.getClassStudents(classData._id);
      setStudents(studentData);
      
      // Initialize attendance with 'Present' for all students
      const initialAttendance = {};
      studentData.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return;

    try {
      setSubmitting(true);
      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        status: attendance[student._id] || 'present'
      }));

      await attendanceService.bulkMarkAttendance({
        classId: selectedClass._id,
        date: new Date(),
        attendanceRecords
      });

      Alert.alert('Success', 'Attendance marked successfully');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }) => {
    const currentStatus = attendance[item._id];

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
          </View>
          <View>
            <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.studentId}>ID: {item.studentId}</Text>
          </View>
        </View>

        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              currentStatus === 'present' && styles.presentBtnActive
            ]}
            onPress={() => updateStatus(item._id, 'present')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'present' && styles.activeBtnText]}>P</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              currentStatus === 'absent' && styles.absentBtnActive
            ]}
            onPress={() => updateStatus(item._id, 'absent')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'absent' && styles.activeBtnText]}>A</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              currentStatus === 'late' && styles.lateBtnActive
            ]}
            onPress={() => updateStatus(item._id, 'late')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'late' && styles.activeBtnText]}>L</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              currentStatus === 'leave' && styles.leaveBtnActive
            ]}
            onPress={() => updateStatus(item._id, 'leave')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'leave' && styles.activeBtnText]}>LV</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !selectedClass) return <Loading message="Loading classes..." />;

  return (
    <View style={styles.container}>
      <GradientHeader title="Mark Attendance" />
      
      <View style={styles.classSelector}>
        <Text style={styles.label}>Select Class:</Text>
        <FlatList
          horizontal
          data={classes}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.classChip,
                selectedClass?._id === item._id && styles.selectedClassChip
              ]}
              onPress={() => handleSelectClass(item)}
            >
              <Text style={[
                styles.classChipText,
                selectedClass?._id === item._id && styles.selectedClassChipText
              ]}>
                {item.className}
              </Text>
            </TouchableOpacity>
          )}
        />
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
              title="Submit Attendance"
              onPress={handleSubmit}
              loading={submitting}
              icon="checkmark-circle"
            />
          </View>
        </>
      ) : (
        <EmptyState
          icon="people-outline"
          title="No Students"
          message="No students found in this class"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  classSelector: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedClassChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  classChipText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedClassChipText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  studentId: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  presentBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  absentBtnActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  lateBtnActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  leaveBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  activeBtnText: {
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});

export default MarkAttendanceScreen;
