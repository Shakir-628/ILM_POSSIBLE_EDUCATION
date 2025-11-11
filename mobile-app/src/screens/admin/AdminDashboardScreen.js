import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/StatCard';
import StudentCard from '../../components/StudentCard';
import Loading from '../../components/Loading';
import LogoutButton from '../../components/LogoutButton';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalParents: 0,
    presentToday: 0,
    absentToday: 0,
    activeClasses: 0,
    pendingFees: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch students data
      const studentsData = await studentService.getAllStudents();
      const students = Array.isArray(studentsData) ? studentsData : studentsData.data || [];
      
      // Calculate stats
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'active').length;
      
      setStats({
        totalStudents: totalStudents,
        activeStudents: activeStudents,
        totalTeachers: 25, // You can fetch from teachers API
        totalClasses: 12, // You can fetch from classes API
        totalParents: Math.floor(totalStudents * 0.8), // Estimate
        presentToday: 0,
        absentToday: 0,
        activeClasses: 12,
        pendingFees: totalStudents * 0.15, // Estimate
      });

      // Get recent students (last 5)
      setRecentStudents(students.slice(0, 5));
      
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
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
          </View>
          <LogoutButton />
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Overview Statistics</Text>
        
        <View style={styles.statsRow}>
          <StatCard 
            title="Active Students" 
            value={stats.activeStudents?.toString() || '0'} 
            icon="checkmark-circle" 
            color="green"
            onPress={() => navigation.navigate('StudentsList')}
          />
          <StatCard 
            title="Total Teachers" 
            value={stats.totalTeachers.toString()} 
            icon="people" 
            color="purple"
            onPress={() => {
              navigation.navigate('TeachersList');
              toast.info('Viewing all teachers');
            }}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard 
            title="Total Parents" 
            value={stats.totalParents.toString()} 
            icon="person" 
            color="indigo"
            onPress={() => {
              navigation.navigate('ParentsList');
              toast.info('Viewing all parents');
            }}
          />
          <StatCard 
            title="Active Classes" 
            value={stats.activeClasses.toString()} 
            icon="calendar" 
            color="pink"
            onPress={() => {
              navigation.navigate('ClassesList');
              toast.info('Viewing active classes');
            }}
          />
        </View>
      </Animated.View>

        {/* Recent Students Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Students</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StudentsList')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentStudents.length > 0 ? (
            recentStudents.map((student) => (
              <StudentCard
                key={student._id}
                student={student}
                onPress={(student) => {
                  toast.info(`Viewing ${student.name}'s details`);
                  // Could navigate to student details screen
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No students found</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate('StudentsList');
                toast.info('Opening students management');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="school" size={32} color={colors.primary} />
              <Text style={styles.actionText}>Manage Students</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate('Announcements');
                toast.info('Opening announcements');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="megaphone" size={32} color={colors.success} />
              <Text style={styles.actionText}>Announcements</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.actionsGrid, { marginTop: spacing.md }]}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate('FeeManagement');
                toast.info('Opening fee management');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="cash" size={32} color="#10B981" />
              <Text style={styles.actionText}>Fee Management</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate('Accounting');
                toast.info('Opening accounting');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="calculator" size={32} color="#F59E0B" />
              <Text style={styles.actionText}>Accounting</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.actionsGrid, { marginTop: spacing.md }]}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate('ClassGradeHistory');
                toast.info('Opening class grade history');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="bar-chart" size={32} color="#8B5CF6" />
              <Text style={styles.actionText}>Grade History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate('Announcements');
                toast.info('Opening announcements');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="megaphone" size={32} color="#EC4899" />
              <Text style={styles.actionText}>Post Announcement</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: { 
    padding: spacing.xxl, 
    paddingTop: spacing.xl, 
    paddingBottom: spacing.xxxl 
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
  role: { 
    fontSize: fontSize.base, 
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statsContainer: { 
    padding: spacing.lg, 
    marginTop: -spacing.xl 
  },
  statsRow: { 
    flexDirection: 'row', 
    marginBottom: spacing.md 
  },
  section: { 
    padding: spacing.lg,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: { 
    fontSize: fontSize.xl, 
    fontWeight: fontWeight.semibold, 
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  viewAllText: { 
    fontSize: fontSize.base, 
    color: colors.primary, 
    fontWeight: fontWeight.semibold 
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: { 
    textAlign: 'center', 
    color: colors.textSecondary, 
    fontSize: fontSize.base, 
    marginTop: spacing.md,
  },
  actionsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: { 
    fontSize: fontSize.sm + 1, 
    fontWeight: fontWeight.semibold, 
    color: colors.textPrimary, 
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default AdminDashboardScreen;

