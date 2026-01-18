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
          subtitle="Excellence in every lesson."
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Attendance')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="checkbox-outline" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Grades')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="create-outline" size={28} color={colors.success} />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>Enter Grades</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.actionsGrid, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F43F5E15' }]}>
                  <Ionicons name="notifications-outline" size={28} color="#F43F5E" />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>Alerts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#8B5CF615' }]}>
                  <Ionicons name="person-outline" size={28} color="#8B5CF6" />
                </View>
                <Text style={[styles.actionText, { color: colors.textPrimary }]}>Profile</Text>
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
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Latest Notices</Text>
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
            <CustomCard style={[styles.infoCard, { backgroundColor: isDarkMode ? colors.primary + '20' : colors.primary + '10' }]}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Use the web app for full class management and detailed reporting features.
              </Text>
            </CustomCard>
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
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default TeacherDashboardScreen;
