import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { gradeService } from '../../services/gradeService';
import { teacherService } from '../../services/teacherService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format } from 'date-fns';

const TeacherClassGradesScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myClasses, setMyClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [classStats, setClassStats] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchMyClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassGrades();
      fetchClassStats();
    }
  }, [selectedClass, selectedTerm]);

  const fetchMyClasses = async () => {
    try {
      const classesData = await teacherService.getMyClasses();
      const classList = Array.isArray(classesData) ? classesData : classesData.data || [];
      setMyClasses(classList);
      
      if (classList.length > 0) {
        setSelectedClass(classList[0]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassGrades = async () => {
    try {
      const params = { classId: selectedClass._id };
      if (selectedTerm !== 'all') params.term = selectedTerm;

      const gradesData = await gradeService.getAllGrades(params);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching class grades:', error);
      toast.error('Failed to load grades');
      setGrades([]);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchClassStats = async () => {
    try {
      const stats = await gradeService.getClassGradeStats(selectedClass._id);
      setClassStats(stats);
    } catch (error) {
      console.error('Error fetching class stats:', error);
      setClassStats(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClassGrades();
    fetchClassStats();
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return colors.success;
    if (grade === 'B+' || grade === 'B') return colors.info;
    if (grade === 'C+' || grade === 'C') return colors.warning;
    return colors.error;
  };

  // Group grades by subject
  const groupedBySubject = grades.reduce((acc, grade) => {
    const subjectName = typeof grade.subject === 'object' 
      ? grade.subject.subjectName 
      : grade.subject || 'Unknown Subject';
    
    if (!acc[subjectName]) {
      acc[subjectName] = {
        subjectName: subjectName,
        grades: [],
      };
    }
    acc[subjectName].grades.push(grade);
    return acc;
  }, {});

  const subjectGradesList = Object.values(groupedBySubject);

  if (loading) {
    return <Loading message="Loading class grades..." />;
  }

  if (myClasses.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Class Grades</Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="school-outline"
            title="No Classes Assigned"
            message="You don't have any classes assigned yet. Contact the admin for assistance."
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Class Grades</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Class Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.classSelector}
        >
          {myClasses.map((cls) => (
            <TouchableOpacity
              key={cls._id}
              style={[
                styles.classChip,
                selectedClass?._id === cls._id && styles.classChipActive
              ]}
              onPress={() => setSelectedClass(cls)}
            >
              <Text style={[
                styles.classChipText,
                selectedClass?._id === cls._id && styles.classChipTextActive
              ]}>
                {cls.className}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Class Statistics */}
        {classStats && (
          <CustomCard style={styles.statsCard}>
            <Text style={styles.statsTitle}>Class Performance</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{classStats.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={24} color={colors.success} />
                <Text style={styles.statValue}>{classStats.averagePercentage?.toFixed(1) || 0}%</Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
            </View>
          </CustomCard>
        )}

        {/* Term Filter */}
        <View style={styles.filterContainer}>
          {['all', '1st', '2nd', '3rd', 'annual'].map((term) => (
            <TouchableOpacity
              key={term}
              style={[
                styles.filterChip,
                selectedTerm === term && styles.filterChipActive
              ]}
              onPress={() => setSelectedTerm(term)}
            >
              <Text style={[
                styles.filterChipText,
                selectedTerm === term && styles.filterChipTextActive
              ]}>
                {term === 'all' ? 'All Terms' : `${term} Term`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results by Subject */}
        {subjectGradesList.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {subjectGradesList.map((subjectData, index) => (
              <CustomCard key={index} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectIconContainer}>
                    <Ionicons name="book" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.subjectTitle}>{subjectData.subjectName}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{subjectData.grades.length}</Text>
                  </View>
                </View>

                {subjectData.grades.map((grade) => (
                  <View key={grade._id} style={styles.gradeItem}>
                    <View style={styles.gradeItemLeft}>
                      <Text style={styles.studentNameText}>
                        {grade.student?.firstName} {grade.student?.lastName}
                      </Text>
                      <View style={styles.gradeItemMeta}>
                        <Text style={styles.examTypeText}>{grade.examType}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.termText}>{grade.term}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.dateText}>
                          {format(new Date(grade.examDate), 'MMM dd')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gradeItemRight}>
                      <View style={[
                        styles.gradeCircle,
                        { backgroundColor: getGradeColor(grade.grade) }
                      ]}>
                        <Text style={styles.gradeCircleText}>{grade.grade}</Text>
                      </View>
                      <Text style={styles.percentageSmall}>
                        {grade.percentage?.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Subject Average */}
                <View style={styles.subjectAverage}>
                  <Text style={styles.averageLabel}>Subject Average:</Text>
                  <Text style={styles.averageValue}>
                    {(subjectData.grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / subjectData.grades.length).toFixed(1)}%
                  </Text>
                </View>
              </CustomCard>
            ))}
          </Animated.View>
        ) : (
          <EmptyState
            icon="school-outline"
            title="No Grades Found"
            message={
              selectedClass
                ? `No grades entered for ${selectedClass.className} yet`
                : "Select a class to view grades"
            }
          />
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
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  classSelector: {
    marginTop: spacing.sm,
  },
  classChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: spacing.sm,
  },
  classChipActive: {
    backgroundColor: colors.white,
  },
  classChipText: {
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: fontWeight.medium,
  },
  classChipTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  content: {
    padding: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  statsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary + '10',
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray200,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  subjectCard: {
    marginBottom: spacing.md,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + '30',
  },
  subjectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  subjectTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  gradeItemLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  studentNameText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  gradeItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  examTypeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  termText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.gray500,
  },
  gradeItemRight: {
    alignItems: 'center',
  },
  gradeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  gradeCircleText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  percentageSmall: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  subjectAverage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.primary + '30',
  },
  averageLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  averageValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});

export default TeacherClassGradesScreen;

