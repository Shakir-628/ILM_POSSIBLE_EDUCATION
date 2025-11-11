import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StatCard from '../../components/StatCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import Loading from '../../components/Loading';
import LogoutButton from '../../components/LogoutButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { timetableService } from '../../services/timetableService';
import { announcementService } from '../../services/announcementService';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';
import { format } from 'date-fns';

const TeacherDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    myClasses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    todayPeriods: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch teacher data
      const [announcementsData] = await Promise.all([
        announcementService.getAllAnnouncements().catch(() => []),
      ]);

      const announcementsList = Array.isArray(announcementsData) ? announcementsData : announcementsData.data || [];
      
      // Set stats (can be updated with real API calls)
      setStats({
        myClasses: 5, // From API when available
        totalStudents: 150, // From API when available
        pendingGrades: 12, // From API when available
        todayPeriods: 6, // From timetable API when available
      });

      setAnnouncements(announcementsList.slice(0, 3));

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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
      }
    >
      <LinearGradient
        colors={['#4F46E5', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{user?.name}!</Text>
            <Text style={styles.subtitle}>Teacher Dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                navigation.navigate('Notifications');
                toast.info('Opening notifications');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.white} />
            </TouchableOpacity>
            <LogoutButton />
          </View>
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
        <View style={styles.statsRow}>
          <StatCard 
            title="My Classes" 
            value={stats.myClasses.toString()} 
            icon="book" 
            color="blue" 
          />
          <StatCard 
            title="Students" 
            value={stats.totalStudents.toString()} 
            icon="people" 
            color="green" 
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard 
            title="Pending Grades" 
            value={stats.pendingGrades.toString()} 
            icon="create" 
            color="orange" 
          />
          <StatCard 
            title="Today's Periods" 
            value={stats.todayPeriods.toString()} 
            icon="time" 
            color="purple" 
          />
        </View>
      </Animated.View>

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
              toast.info('Mark Attendance feature');
              // navigation.navigate('MarkAttendance');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="checkbox-outline" size={32} color={colors.primary} />
            <Text style={styles.actionText}>Mark Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              toast.info('Grade Entry feature');
              // navigation.navigate('GradeEntry');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={32} color={colors.success} />
            <Text style={styles.actionText}>Enter Grades</Text>
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
              navigation.navigate('Notifications');
              toast.info('Opening notifications');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={32} color="#EF4444" />
            <Text style={styles.actionText}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
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
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              compact={true}
            />
          ))}
        </Animated.View>
      )}

      {/* Info Card */}
      <View style={styles.section}>
        <CustomCard style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4F46E5" />
          <Text style={styles.infoText}>
            Use the web app for full class management and detailed reporting features.
          </Text>
        </CustomCard>
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
    alignItems: 'center' 
  },
  headerInfo: { flex: 1 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full || borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
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
    marginBottom: spacing.sm 
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
    fontWeight: fontWeight.bold, 
    color: colors.textPrimary 
  },
  viewAllText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    flex: 1,
    lineHeight: 20,
  },
});

export default TeacherDashboardScreen;

