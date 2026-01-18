import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StatCard from '../../components/StatCard';
import StudentCard from '../../components/StudentCard';
import Loading from '../../components/Loading';
import CustomCard from '../../components/CustomCard';
import CurvedHeader from '../../components/CurvedHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parentService } from '../../services/parentService';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../utils/designSystem';

const ParentDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { colors, isDarkMode } = useDesignSystem();
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

      let totalPendingFees = 0;
      let totalAttendance = 0;
      let totalGrades = 0;
      let childrenCount = childrenList.length;

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

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
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

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <CurvedHeader
          title={`Hi, ${user?.name?.split(' ')[0]}! 👋`}
          subtitle="Your family's progress at a glance."
        />

        <View style={styles.overlapContent}>
          {/* Stats container */}
          <Animated.View
            style={[
              styles.statsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
                value={`₨ ${stats.totalPendingFees}`}
                icon="cash"
                color="red"
              />
            </View>
          </Animated.View>

          {/* My Children */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Linked Students</Text>
              {children.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('Children')}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All →</Text>
                </TouchableOpacity>
              )}
            </View>

            {children.length > 0 ? (
              children.map((child) => (
                <StudentCard
                  key={child._id || child.studentId}
                  student={child}
                  onPress={(childData) => {
                    navigation.navigate('ChildDetails', { student: childData });
                    toast.info(`Viewing ${childData.name}'s performance`);
                  }}
                  showEmail={false}
                />
              ))
            ) : (
              <CustomCard style={{ backgroundColor: colors.cardBackground }}>
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={colors.gray300} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No children linked to your account</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Contact school admin for linkage.</Text>
                </View>
              </CustomCard>
            )}
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Children')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="people-outline" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>My Children</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('ParentFees')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="card-outline" size={28} color="#10B981" />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>Fee Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  overlapContent: {
    marginTop: -45,
    zIndex: 10,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ParentDashboardScreen;
