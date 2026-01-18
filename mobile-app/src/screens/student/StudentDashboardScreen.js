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
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Schedule</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Timetable')}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>Full View →</Text>
              </TouchableOpacity>
            </View>
            {todaySchedule.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {todaySchedule.map((item, index) => (
                  <CustomCard key={index} style={styles.scheduleCard}>
                    <View style={[styles.periodTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.periodText, { color: colors.primary }]}>Period {item.period || index + 1}</Text>
                    </View>
                    <Text style={[styles.subjectName, { color: colors.textPrimary }]}>{item.subject}</Text>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.startTime} - {item.endTime}</Text>
                    </View>
                  </CustomCard>
                ))}
              </ScrollView>
            ) : (
              <CustomCard>
                <View style={styles.emptySchedule}>
                  <Ionicons name="calendar-outline" size={32} color={colors.gray300} />
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No classes scheduled for today.</Text>
                </View>
              </CustomCard>
            )}
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Attendance')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="checkmark-done" size={24} color={colors.success} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Grades')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="school" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Grades</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Announcements')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="megaphone" size={24} color="#F59E0B" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Notices</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Announcements */}
          {announcements.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Latest Notices</Text>
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

const styles = StyleSheet.create({
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
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  scheduleCard: {
    width: 160,
    marginRight: 12,
    padding: 12,
  },
  periodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptySchedule: {
    alignItems: 'center',
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StudentDashboardScreen;
