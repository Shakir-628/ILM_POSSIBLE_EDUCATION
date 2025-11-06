import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import CustomCard from '../../components/CustomCard';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';

const ChildDetailsScreen = ({ route, navigation }) => {
  const { student } = route.params;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attendance: 0,
    assignments: 0,
    averageGrade: 0,
    pendingFees: 0,
  });

  useEffect(() => {
    fetchChildData();
  }, []);

  const fetchChildData = async () => {
    try {
      const [attendanceData, assignmentsData, gradesData, feesData] = await Promise.all([
        parentService.getChildAttendance(student._id || student.studentId).catch(() => ({ percentage: 0 })),
        parentService.getChildAssignments(student._id || student.studentId).catch(() => []),
        parentService.getChildGrades(student._id || student.studentId).catch(() => []),
        parentService.getChildFees(student._id || student.studentId).catch(() => ({ pending: 0 })),
      ]);

      const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [];
      const grades = Array.isArray(gradesData) ? gradesData : gradesData.data || [];
      
      const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
      const averageGrade = grades.length > 0
        ? (grades.reduce((sum, g) => sum + (g.marksObtained / g.totalMarks * 100), 0) / grades.length).toFixed(1)
        : 0;

      setStats({
        attendance: attendanceData.percentage || attendanceData.attendancePercentage || 0,
        assignments: pendingAssignments,
        averageGrade,
        pendingFees: feesData.pending || feesData.totalPending || 0,
      });
    } catch (error) {
      console.error('Error fetching child data:', error);
      toast.error('Failed to load child data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildData();
  };

  const QuickAccessCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickAccessCard}>
      <View style={[styles.quickAccessIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickAccessTitle}>{title}</Text>
      <Text style={[styles.quickAccessValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading message="Loading child details..." />;
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title={student.name}
        subtitle={`${student.studentId} • ${typeof student.class === 'object' ? student.class?.className : student.class} ${student.section}`}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Attendance"
              value={`${stats.attendance}%`}
              icon="calendar"
              color="blue"
            />
            <StatCard
              title="Avg Grade"
              value={`${stats.averageGrade}%`}
              icon="trophy"
              color="green"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Assignments"
              value={stats.assignments.toString()}
              icon="document-text"
              color="orange"
            />
            <StatCard
              title="Pending Fees"
              value={`PKR ${stats.pendingFees}`}
              icon="cash"
              color="red"
            />
          </View>
        </View>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <QuickAccessCard
            icon="calendar-outline"
            title="Attendance"
            value="View Details"
            color="#3B82F6"
            onPress={() => toast.info('Feature coming soon')}
          />
          <QuickAccessCard
            icon="book-outline"
            title="Grades"
            value="View Report"
            color="#10B981"
            onPress={() => toast.info('Feature coming soon')}
          />
          <QuickAccessCard
            icon="document-text-outline"
            title="Assignments"
            value="View All"
            color="#F59E0B"
            onPress={() => toast.info('Feature coming soon')}
          />
          <QuickAccessCard
            icon="cash-outline"
            title="Pay Fees"
            value="Make Payment"
            color="#EF4444"
            onPress={() => toast.info('Feature coming soon')}
          />
        </View>

        {/* Student Information */}
        <Text style={styles.sectionTitle}>Student Information</Text>
        <CustomCard>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{student.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID</Text>
            <Text style={styles.infoValue}>{student.studentId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Class</Text>
            <Text style={styles.infoValue}>
              {typeof student.class === 'object' ? student.class?.className : student.class} {student.section}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{student.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: student.status === 'active' ? '#10B981' : '#EF4444' 
            }]}>
              <Text style={styles.statusText}>
                {student.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </CustomCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: '2%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quickAccessValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ChildDetailsScreen;

