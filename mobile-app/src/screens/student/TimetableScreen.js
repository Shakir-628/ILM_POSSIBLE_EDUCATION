import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import { timetableService } from '../../services/timetableService';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';
import { format } from 'date-fns';

const TimetableScreen = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timetable, setTimetable] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await timetableService.getMyTimetable();
      setTimetable(data.data || data);

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
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todaySchedule = timetable?.schedule?.[currentDay - 1]; // Adjust for Sunday = 0

  // Color palette for subjects
  const subjectColors = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.error,
    colors.info,
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
  ];

  const getSubjectColor = (index) => {
    return subjectColors[index % subjectColors.length];
  };

  if (loading) {
    return <Loading message="Loading timetable..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="calendar" size={40} color={colors.white} />
          <Text style={styles.headerTitle}>My Timetable</Text>
          <Text style={styles.headerSubtitle}>
            {format(new Date(), 'EEEE, MMMM dd')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Classes ({days[currentDay]})</Text>

            {todaySchedule?.periods && todaySchedule.periods.length > 0 ? (
              todaySchedule.periods.map((period, index) => (
                <CustomCard key={index} style={styles.periodCard}>
                  <View style={styles.period}>
                    <View style={[styles.colorBar, { backgroundColor: getSubjectColor(index) }]} />
                    
                    <View style={styles.periodContent}>
                      <View style={styles.periodHeader}>
                        <View style={[styles.periodNumber, { backgroundColor: getSubjectColor(index) + '20' }]}>
                          <Text style={[styles.periodNumberText, { color: getSubjectColor(index) }]}>
                            {index + 1}
                          </Text>
                        </View>
                        <View style={styles.timeContainer}>
                          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                          <Text style={styles.periodTime}>
                            {period.startTime} - {period.endTime}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.subject}>{period.subject?.subjectName || 'Free Period'}</Text>
                      
                      {period.teacher && (
                        <View style={styles.teacherRow}>
                          <Ionicons name="person" size={14} color={colors.textSecondary} />
                          <Text style={styles.teacher}>
                            {period.teacher.firstName} {period.teacher.lastName}
                          </Text>
                        </View>
                      )}
                      
                      {period.roomNumber && (
                        <View style={styles.roomRow}>
                          <Ionicons name="location" size={14} color={colors.textSecondary} />
                          <Text style={styles.room}>Room {period.roomNumber}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </CustomCard>
              ))
            ) : (
              <CustomCard>
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
                  <Text style={styles.emptyText}>No classes scheduled for today</Text>
                </View>
              </CustomCard>
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
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  periodCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  period: {
    flexDirection: 'row',
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  periodContent: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  periodNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodNumberText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  periodTime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  subject: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  teacher: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  room: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default TimetableScreen;

