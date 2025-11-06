import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/StatCard';
import StudentCard from '../../components/StudentCard';
import LogoutButton from '../../components/LogoutButton';
import Loading from '../../components/Loading';
import CustomCard from '../../components/CustomCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parentService } from '../../services/parentService';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';

const ParentDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalPendingFees: 0,
    avgAttendance: 0,
    avgGrades: 0,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const childrenData = await parentService.getMyChildren();
      const childrenList = Array.isArray(childrenData) ? childrenData : childrenData.data || childrenData.children || [];
      
      setChildren(childrenList);
      
      // Calculate combined stats from all children
      let totalPendingFees = 0;
      let totalAttendance = 0;
      let totalGrades = 0;
      let childrenCount = childrenList.length;

      // Fetch stats for each child
      for (const child of childrenList) {
        try {
          const [feesData, attendanceData, gradesData] = await Promise.all([
            parentService.getChildFees(child._id || child.studentId).catch(() => ({ pending: 0 })),
            parentService.getChildAttendance(child._id || child.studentId).catch(() => ({ percentage: 0 })),
            parentService.getChildGrades(child._id || child.studentId).catch(() => []),
          ]);

          totalPendingFees += feesData.pending || feesData.totalPending || 0;
          totalAttendance += attendanceData.percentage || attendanceData.attendancePercentage || 0;
          
          const grades = Array.isArray(gradesData) ? gradesData : gradesData.data || [];
          if (grades.length > 0) {
            const avgGrade = grades.reduce((sum, g) => sum + (g.marksObtained / g.totalMarks * 100), 0) / grades.length;
            totalGrades += avgGrade;
          }
        } catch (err) {
          console.error('Error fetching child stats:', err);
        }
      }

      setStats({
        totalChildren: childrenCount,
        totalPendingFees,
        avgAttendance: childrenCount > 0 ? (totalAttendance / childrenCount).toFixed(1) : 0,
        avgGrades: childrenCount > 0 ? (totalGrades / childrenCount).toFixed(1) : 0,
      });

      // Trigger animations
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
      toast.error('Failed to load dashboard');
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
      <LinearGradient
        colors={['#4F46E5', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name}!</Text>
            <Text style={styles.subtitle}>Parent Dashboard</Text>
          </View>
          <LogoutButton />
        </View>
      </LinearGradient>

      {/* Stats */}
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
            title="Children" 
            value={stats.totalChildren.toString()} 
            icon="people" 
            color="blue" 
          />
          <StatCard 
            title="Avg Attendance" 
            value={`${stats.avgAttendance}%`} 
            icon="checkmark-circle" 
            color="green" 
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard 
            title="Avg Grades" 
            value={`${stats.avgGrades}%`} 
            icon="trophy" 
            color="purple" 
          />
          <StatCard 
            title="Pending Fees" 
            value={`PKR ${stats.totalPendingFees}`} 
            icon="cash" 
            color="red" 
          />
        </View>
      </Animated.View>

      {/* My Children */}
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
          <Text style={styles.sectionTitle}>My Children</Text>
          {children.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Children')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          )}
        </View>

        {children.length > 0 ? (
          children.map((child) => (
            <StudentCard
              key={child._id || child.studentId}
              student={child}
              onPress={(child) => {
                navigation.navigate('ChildDetails', { student: child });
                toast.info(`Viewing ${child.name}'s details`);
              }}
              showEmail={false}
            />
          ))
        ) : (
          <CustomCard>
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No children linked to your account</Text>
              <Text style={styles.emptySubtext}>Contact admin to link your children</Text>
            </View>
          </CustomCard>
        )}
      </Animated.View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Children')}
          >
            <Ionicons name="people-outline" size={32} color="#4F46E5" />
            <Text style={styles.actionText}>View Children</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ParentFees')}
          >
            <Ionicons name="card-outline" size={32} color="#10B981" />
            <Text style={styles.actionText}>Pay Fees</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: spacing.xs 
  },
  userName: { 
    fontSize: fontSize.display, 
    fontWeight: fontWeight.bold, 
    color: colors.white, 
    marginBottom: spacing.sm 
  },
  subtitle: { 
    fontSize: fontSize.base, 
    color: 'rgba(255, 255, 255, 0.85)' 
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
    padding: spacing.lg 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.base,
    marginTop: spacing.md,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
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

export default ParentDashboardScreen;

