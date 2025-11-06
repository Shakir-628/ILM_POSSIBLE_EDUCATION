import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/StatCard';
import CustomCard from '../../components/CustomCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import Loading from '../../components/Loading';
import LogoutButton from '../../components/LogoutButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { assignmentService } from '../../services/assignmentService';
import { gradeService } from '../../services/gradeService';
import { feeService } from '../../services/feeService';
import { announcementService } from '../../services/announcementService';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';
import { format } from 'date-fns';

const StudentDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    pendingFees: 0,
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data
      const [
        attendanceData,
        assignmentsData,
        gradesData,
        feesData,
        announcementsData,
      ] = await Promise.all([
        attendanceService.getAttendanceStats(user.id).catch(() => ({ percentage: 0 })),
        assignmentService.getMyAssignments().catch(() => []),
        gradeService.getMyGrades().catch(() => []),
        feeService.getMyFees().catch(() => ({ pending: 0 })),
        announcementService.getAllAnnouncements().catch(() => ({ data: [] })),
      ]);

      // Calculate stats
      const pendingAssignments = Array.isArray(assignmentsData)
        ? assignmentsData.filter(a => a.status === 'pending').length
        : 0;

      const grades = Array.isArray(gradesData) ? gradesData : [];
      const averageGrade = grades.length > 0
        ? (grades.reduce((sum, g) => sum + (g.marksObtained / g.totalMarks * 100), 0) / grades.length).toFixed(1)
        : 0;

      const announcements = announcementsData.data || announcementsData || [];

      setStats({
        attendancePercentage: attendanceData.percentage || attendanceData.attendancePercentage || 0,
        pendingAssignments,
        averageGrade,
        pendingFees: feesData.pending || feesData.totalPending || 0,
      });

      setRecentAnnouncements(Array.isArray(announcements) ? announcements.slice(0, 3) : []);
      
      // Trigger animations after data loads
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
      }
    >
      {/* Greeting Section */}
      <LinearGradient
        colors={['#4F46E5', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.greetingSection}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}!</Text>
            <Text style={styles.subtitle}>Here's your academic overview</Text>
          </View>
          <LogoutButton />
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.statsRow}>
          <StatCard
            title="Attendance"
            value={`${stats.attendancePercentage}%`}
            icon="calendar"
            color="blue"
            onPress={() => navigation.navigate('Attendance')}
          />
          <StatCard
            title="Pending"
            value={stats.pendingAssignments.toString()}
            icon="document-text"
            color="orange"
            subtitle="Assignments"
            onPress={() => navigation.navigate('Assignments')}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon="school"
            color="green"
            onPress={() => navigation.navigate('Grades')}
          />
          <StatCard
            title="Pending Fees"
            value={`PKR ${stats.pendingFees}`}
            icon="cash"
            color="red"
          />
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Timetable')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="time" size={24} color="#2563eb" />
            </View>
            <Text style={styles.quickActionText}>Timetable</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Assignments')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="document-text" size={24} color="#ea580c" />
            </View>
            <Text style={styles.quickActionText}>Assignments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Attendance')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="checkmark-done" size={24} color="#16a34a" />
            </View>
            <Text style={styles.quickActionText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#faf5ff' }]}>
              <Ionicons name="card" size={24} color="#9333ea" />
            </View>
            <Text style={styles.quickActionText}>ID Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Announcements */}
      {/* Recent Announcements */}
      {recentAnnouncements.length > 0 && (
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          {recentAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              compact={true}
            />
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  greetingSection: {
    padding: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  headerInfo: { flex: 1 },
  greeting: {
    fontSize: fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statsContainer: {
    padding: spacing.lg,
    marginTop: -spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.sm + 1,
    fontWeight: fontWeight.semibold,
    color: colors.gray700,
    textAlign: 'center',
  },
});

export default StudentDashboardScreen;

