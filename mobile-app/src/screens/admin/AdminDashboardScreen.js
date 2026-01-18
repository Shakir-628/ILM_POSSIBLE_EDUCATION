import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Loading from '../../components/Loading';
import CurvedHeader from '../../components/CurvedHeader';
import NoticeBoard from '../../components/NoticeBoard';
import MenuGrid from '../../components/MenuGrid';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import { parentService } from '../../services/parentService';
import { feeService } from '../../services/feeService';
import { announcementService } from '../../services/announcementService';
import { useToast } from '../../context/ToastContext';
import { useDesignSystem, spacing, fontSize, fontWeight } from '../../utils/designSystem';
import StatCard from '../../components/StatCard';
import { format } from 'date-fns';

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { colors, shadows, isDarkMode } = useDesignSystem();
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
  const [notices, setNotices] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        studentsData,
        teachersData,
        classesData,
        parentsData,
        feeStatsData,
        announcementsData
      ] = await Promise.all([
        studentService.getAllStudents(),
        teacherService.getAllTeachers().catch(() => []),
        classService.getAllClasses().catch(() => []),
        parentService.getAllParents().catch(() => []),
        feeService.getFeeStatistics().catch(() => ({ totalPending: 0 })),
        announcementService.getAllAnnouncements().catch(() => [])
      ]);

      const students = Array.isArray(studentsData) ? studentsData : studentsData.data || [];
      const teachers = Array.isArray(teachersData) ? teachersData : teachersData.data || [];
      const classes = Array.isArray(classesData) ? classesData : classesData.data || [];
      const parents = Array.isArray(parentsData) ? parentsData : parentsData.data || [];
      const announcements = Array.isArray(announcementsData) ? announcementsData : announcementsData.data || [];

      // Calculate stats
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'active').length;
      const activeClasses = classes.filter(c => c.status !== 'inactive').length;

      setStats({
        totalStudents: totalStudents,
        activeStudents: activeStudents,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalParents: parents.length,
        presentToday: 0,
        absentToday: 0,
        activeClasses: activeClasses,
        pendingFees: feeStatsData.totalPending || feeStatsData.pendingAmount || 0,
      });

      // Process announcements for NoticeBoard
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedNotices = announcements
        .filter(notice => {
          if (notice.status && notice.status !== 'published') return false;
          if (notice.expiresAt) return new Date(notice.expiresAt) >= today;
          return true;
        })
        .slice(0, 5)
        .map((notice, index) => {
          const colorsList = ['#E0E7FF', '#FCE7F3', '#DCFCE7', '#FEF3C7', '#DBEAFE'];
          return {
            id: notice._id,
            title: notice.title,
            date: format(new Date(notice.createdAt || new Date()), 'dd MMMM yyyy'),
            color: colorsList[index % colorsList.length],
            image: 'https://cdn-icons-png.flaticon.com/512/2583/2583319.png'
          };
        });
      setNotices(processedNotices);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Dashboard error:', error);
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

  const menuItems = [
    { label: 'Students', onPress: () => navigation.navigate('StudentsList'), image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { label: 'Finances', onPress: () => navigation.navigate('FeeManagement'), image: 'https://cdn-icons-png.flaticon.com/512/2454/2454282.png' },
    { label: 'Notices', onPress: () => navigation.navigate('Announcements'), image: 'https://cdn-icons-png.flaticon.com/512/1458/1458512.png' },
    { label: 'Faculty', onPress: () => navigation.navigate('TeachersList'), image: 'https://cdn-icons-png.flaticon.com/512/1995/1995539.png' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <CurvedHeader
          subtitle="Manage your institution."
          onNotificationPress={() => navigation.navigate('Notifications')}
        />

        <View style={styles.overlapContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Academic Overview */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Academic Overview</Text>
              <View style={styles.statsRow}>
                <StatCard title="Students" value={stats.totalStudents} icon="people-outline" color="blue" />
                <StatCard title="Teachers" value={stats.totalTeachers} icon="school-outline" color="green" />
              </View>
              <View style={styles.statsRow}>
                <StatCard title="Classes" value={stats.totalClasses} icon="business-outline" color="indigo" />
                <StatCard title="Pending Fees" value={`₨ ${stats.pendingFees?.toLocaleString()}`} icon="wallet-outline" color="orange" />
              </View>
            </View>

            {/* Notice Board */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Bulletin Board</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All →</Text>
                </TouchableOpacity>
              </View>
              {notices.length > 0 ? (
                <NoticeBoard notices={notices} />
              ) : (
                <TouchableOpacity style={[styles.emptyBox, { borderColor: colors.gray200 }]} onPress={() => navigation.navigate('Announcements')}>
                  <Ionicons name="megaphone-outline" size={32} color={colors.gray300} />
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Post first announcement</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Management Hub</Text>
              <MenuGrid items={menuItems} />
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  overlapContent: { marginTop: -45, zIndex: 10 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600' },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed'
  },
});

export default AdminDashboardScreen;
