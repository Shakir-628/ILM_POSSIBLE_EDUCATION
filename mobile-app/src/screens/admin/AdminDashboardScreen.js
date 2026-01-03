import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StudentCard from '../../components/StudentCard';
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
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format } from 'date-fns';

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

      // Get recent students (last 5)
      setRecentStudents(students.slice(0, 5));

      // Process announcements for NoticeBoard
      const processedNotices = announcements.slice(0, 5).map((notice, index) => {
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

  const menuItems = [
    {
      label: 'Student Directory',
      onPress: () => navigation.navigate('StudentsList'),
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    },
    {
      label: 'Fee Management',
      onPress: () => navigation.navigate('FeeManagement'),
      image: 'https://cdn-icons-png.flaticon.com/512/2454/2454282.png'
    },
    {
      label: 'Events',
      onPress: () => navigation.navigate('Announcements'),
      image: 'https://cdn-icons-png.flaticon.com/512/1458/1458512.png'
    },
    {
      label: 'Teachers',
      onPress: () => navigation.navigate('TeachersList'),
      image: 'https://cdn-icons-png.flaticon.com/512/1995/1995539.png'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
      >
        <CurvedHeader
          subtitle="Welcome to EduNest!"
          onNotificationPress={() => toast.info('Notifications clicked')}
        />

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Notice Board */}
          <NoticeBoard notices={notices} />

          {/* Academic Overview / Menu Grid */}
          <MenuGrid items={menuItems} />

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
                    navigation.navigate('StudentDetail', { student });
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
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
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
});

export default AdminDashboardScreen;

