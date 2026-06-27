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
import { announcementService } from '../../services/announcementService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../utils/designSystem';

const TeacherDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { colors, isDarkMode } = useDesignSystem();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    myClasses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    todayPeriods: 0,
  });
  const [announcements, setAnnouncements] = useState([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [announcementsData] = await Promise.all([
        announcementService.getAllAnnouncements().catch(() => []),
      ]);

      const announcementsList = Array.isArray(announcementsData) ? announcementsData : announcementsData.data || [];

      setStats({
        myClasses: 5,
        totalStudents: 151,
        pendingGrades: 12,
        todayPeriods: 6,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeAnnouncements = announcementsList.filter(notice => {
        if (notice.expiresAt) {
          return new Date(notice.expiresAt) >= today;
        }
        const createDate = new Date(notice.createdAt);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return createDate >= thirtyDaysAgo;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAnnouncements(activeAnnouncements.slice(0, 3));

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
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
          subtitle="Ready to inspire today's learners?"
        />

        <View style={styles.overlapContent}>
          {/* Stats Section */}
          <Animated.View
            style={[
              styles.statsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
                title="Total Students"
                value={stats.totalStudents.toString()}
                icon="people"
                color="green"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Pending Tasks"
                value={stats.pendingGrades.toString()}
                icon="create"
                color="orange"
              />
              <StatCard
                title="Active Periods"
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Attendance')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.05)']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="checkbox" size={28} color={colors.primary} />
                </LinearGradient>
                <Text style={styles.actionText}>Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Grades')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="create" size={28} color={colors.success} />
                </LinearGradient>
                <Text style={styles.actionText}>Grades</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.actionsGrid, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(244, 63, 94, 0.15)', 'rgba(244, 63, 94, 0.05)']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="notifications" size={28} color="#F43F5E" />
                </LinearGradient>
                <Text style={styles.actionText}>Alerts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="person" size={28} color="#8B5CF6" />
                </LinearGradient>
                <Text style={styles.actionText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Recent Announcements */}
          {announcements.length > 0 && (
            <Animated.View
              style={[
                styles.section,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Updates & Notices</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All →</Text>
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
            <LinearGradient
              colors={isDarkMode ? ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.1)'] : ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.05)']}
              style={styles.infoCard}
            >
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Need advanced features? Access the Teacher Portal on your desktop for detailed reports.
              </Text>
            </LinearGradient>
          </View>
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
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary + '20',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontWeight: '600',
  },
});

export default TeacherDashboardScreen;
