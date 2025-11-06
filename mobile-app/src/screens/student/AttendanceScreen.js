import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/StatCard';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';
import { format } from 'date-fns';

const AttendanceScreen = ({ navigation }) => {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    percentage: 0,
    present: 0,
    absent: 0,
    total: 0,
  });
  const [markedDates, setMarkedDates] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const currentDate = new Date();
      const data = await attendanceService.getMyAttendance({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });

      const attendanceArray = Array.isArray(data) ? data : data.data || [];
      setAttendanceData(attendanceArray);

      // Calculate stats
      const present = attendanceArray.filter(a => a.status === 'Present').length;
      const absent = attendanceArray.filter(a => a.status === 'Absent').length;
      const total = attendanceArray.length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

      setStats({ percentage, present, absent, total });

      // Mark dates on calendar
      const dates = {};
      attendanceArray.forEach(attendance => {
        const date = new Date(attendance.date).toISOString().split('T')[0];
        dates[date] = {
          marked: true,
          dotColor: attendance.status === 'Present' ? '#22c55e' : '#ef4444',
          selected: true,
          selectedColor: attendance.status === 'Present' ? '#22c55e' : '#ef4444',
        };
      });
      setMarkedDates(dates);

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
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  if (loading) {
    return <Loading message="Loading attendance..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={gradients.info} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Attendance</Text>
          <Text style={styles.headerSubtitle}>
            Track your attendance record
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
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
              title="Attendance"
              value={`${stats.percentage}%`}
              icon="checkmark-circle"
              color="blue"
            />
            <StatCard
              title="Present Days"
              value={stats.present.toString()}
              icon="checkmark"
              color="green"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Absent Days"
              value={stats.absent.toString()}
              icon="close"
              color="red"
            />
            <StatCard
              title="Total Days"
              value={stats.total.toString()}
              icon="calendar"
              color="indigo"
            />
          </View>
        </Animated.View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Calendar</Text>
          <CustomCard>
            <Calendar
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: fontSize.base,
                textMonthFontSize: fontSize.lg,
                textDayHeaderFontSize: fontSize.sm,
              }}
              onMonthChange={(month) => {
                setSelectedMonth(new Date(month.year, month.month - 1));
              }}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Present</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.legendText}>Absent</Text>
              </View>
            </View>
          </CustomCard>
        </View>

        {/* Recent Attendance */}
        {attendanceData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Record</Text>
            {attendanceData.slice(0, 5).map((record, index) => (
              <CustomCard key={index} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={[styles.statusIndicator, {
                    backgroundColor: record.status === 'Present' ? colors.success : colors.error,
                  }]}>
                    <Ionicons 
                      name={record.status === 'Present' ? 'checkmark' : 'close'} 
                      size={16} 
                      color={colors.white} 
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordDate}>
                      {format(new Date(record.date), 'EEEE, MMMM dd, yyyy')}
                    </Text>
                    <Text style={[styles.recordStatus, {
                      color: record.status === 'Present' ? colors.success : colors.error,
                    }]}>
                      {record.status}
                    </Text>
                  </View>
                </View>
              </CustomCard>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    padding: spacing.lg,
    marginTop: -spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  recordCard: {
    marginBottom: spacing.sm,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  recordStatus: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

export default AttendanceScreen;

