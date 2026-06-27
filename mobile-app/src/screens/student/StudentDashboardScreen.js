import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StatCard from '../../components/StatCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import Loading from '../../components/Loading';
import CustomCard from '../../components/CustomCard';
import CurvedHeader from '../../components/CurvedHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services/attendanceService';
import { assignmentService } from '../../services/assignmentService';
import { gradeService } from '../../services/gradeService';
import { feeService } from '../../services/feeService';
import { announcementService } from '../../services/announcementService';
import { timetableService } from '../../services/timetableService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../utils/designSystem';

const StudentDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { colors, isDarkMode } = useDesignSystem();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attendance: 0,
    pendingAssignments: 0,
    avgGrade: 0,
    pendingFees: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        attendanceData,
        assignmentsData,
        gradesData,
        feesData,
        announcementsData,
        timetableData,
      ] = await Promise.all([
        attendanceService.getMyAttendance().catch(() => ({ percentage: 0 })),
        assignmentService.getMyAssignments().catch(() => []),
        gradeService.getMyGrades().catch(() => []),
        feeService.getMyFees().catch(() => ({ totalPending: 0 })),
        announcementService.getAllAnnouncements().catch(() => []),
        timetableService.getMyTimetable().catch(() => ({ schedule: [] })),
      ]);

      const pendingAssignments = (Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [])
        .filter(a => a.status === 'pending').length;

      const gradesList = Array.isArray(gradesData) ? gradesData : gradesData.data || [];
      const avgGrade = gradesList.length > 0
        ? (gradesList.reduce((sum, g) => sum + (g.marksObtained / g.totalMarks * 100), 0) / gradesList.length).toFixed(1)
        : 0;

      setStats({
        attendance: attendanceData.percentage || attendanceData.attendancePercentage || 0,
        pendingAssignments,
        avgGrade,
        pendingFees: feesData.totalPending || feesData.pendingAmount || 0,
      });

      const processedAnnouncements = (Array.isArray(announcementsData) ? announcementsData : announcementsData.data || [])
        .slice(0, 3);
      setAnnouncements(processedAnnouncements);

      const schedule = Array.isArray(timetableData) ? timetableData : (timetableData.schedule || timetableData.data || []);
      setTodaySchedule(schedule);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
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
    return <Loading message="Loading your dashboard..." />;
  }

  const styles = getStyles(colors, isDarkMode);

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
          subtitle="Success begins with learning."
        />

        <View style={styles.overlapContent}>
          {/* Stats Grid */}
          <Animated.View
            style={[
              styles.statsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.statsRow}>
              <StatCard
                title="Attendance"
                value={`${stats.attendance}%`}
                icon="checkmark-circle"
                color="green"
              />
              <StatCard
                title="Assignments"
                value={stats.pendingAssignments.toString()}
                icon="document-text"
                color="blue"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Avg Grade"
                value={`${stats.avgGrade}%`}
                icon="trophy"
                color="purple"
              />
              <StatCard
                title="Pending Fees"
                value={`₨ ${stats.pendingFees}`}
                icon="card"
                color="red"
              />
            </View>
          </Animated.View>

          {/* Today's Schedule */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Timetable')}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View Full →</Text>
              </TouchableOpacity>
            </View>
            {todaySchedule.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {todaySchedule.map((item, index) => (
                  <LinearGradient
                    key={index}
                    colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
                    style={[styles.scheduleCard, shadows.medium]}
                  >
                    <View style={[styles.periodTag, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.periodText, { color: colors.primary }]}>PERIOD {item.period || index + 1}</Text>
                    </View>
                    <Text style={[styles.subjectName, { color: colors.textPrimary }]} numberOfLines={1}>{item.subject}</Text>
                    <View style={styles.timeRow}>
                      <Ionicons name="time" size={14} color={colors.primary} />
                      <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.startTime} - {item.endTime}</Text>
                    </View>
                    <View style={styles.roomRow}>
                      <Ionicons name="location" size={14} color={colors.textTertiary} />
                      <Text style={[styles.roomText, { color: colors.textTertiary }]}>Room {item.room || 'A1'}</Text>
                    </View>
                  </LinearGradient>
                ))}
              </ScrollView>
            ) : (
              <LinearGradient
                colors={isDarkMode ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['#FFFFFF', '#F1F5F9']}
                style={[styles.emptyScheduleCard, shadows.small]}
              >
                <View style={styles.emptySchedule}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="calendar" size={32} color={colors.gray300} />
                  </View>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No classes scheduled for today.</Text>
                </View>
              </LinearGradient>
            )}
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Center</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Assignments')}
              >
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.05)']}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="document-text" size={26} color={colors.primary} />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Homework</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Grades')}
              >
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="trophy" size={26} color="#8B5CF6" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Results</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Timetable')}
              >
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="calendar" size={26} color="#F59E0B" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Announcements */}
          {announcements.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>School News</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>See All →</Text>
                </TouchableOpacity>
              </View>
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement._id}
                  announcement={announcement}
                  compact={true}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
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
    marginTop: -55,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  scheduleCard: {
    width: 170,
    marginRight: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyScheduleCard: {
    borderRadius: 24,
    padding: 24,
  },
  emptySchedule: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    ...shadows.medium,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

export default StudentDashboardScreen;
