import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

const StudentsListScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      const studentsList = Array.isArray(data) ? data : data.data || [];
      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student => {
      const className = typeof student.class === 'object' ? student.class?.className : student.class;
      return (
        student.name?.toLowerCase().includes(query) ||
        student.studentId?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        className?.toLowerCase().includes(query)
      );
    });
    setFilteredStudents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const renderStudent = ({ item }) => (
    <CustomCard style={styles.studentCard}>
      <View style={styles.studentRow}>
        <View style={styles.studentAvatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || 'S'}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentDetails}>
            {item.studentId} • {typeof item.class === 'object' ? item.class?.className : item.class} {item.section}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'active' ? '#10B981' : '#EF4444' 
        }]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </CustomCard>
  );

  if (loading) {
    return <Loading message="Loading students..." />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>All Students</Text>
          <Text style={styles.subtitle}>{students.length} students total</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, class..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {filteredStudents.length === 0 ? (
        <EmptyState 
          icon="people-outline" 
          title="No Students Found" 
          message={searchQuery ? "Try a different search term" : "No students in the system yet"} 
        />
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudent}
          keyExtractor={(item) => item._id || item.studentId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { padding: 24, paddingTop: 20, paddingBottom: 24, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 4 },
  searchContainer: { padding: 16 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  list: { padding: 16 },
  studentCard: { marginBottom: 12 },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  studentDetails: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  studentEmail: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#fff' },
});

export default StudentsListScreen;

