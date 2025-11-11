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
import { classService } from '../../services/classService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format } from 'date-fns';

const ClassGradeHistoryScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [classStats, setClassStats] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassGrades();
      fetchClassStats();
    }
  }, [selectedClass, selectedTerm, selectedExamType]);

  const fetchClasses = async () => {
    try {
      const classesData = await classService.getAllClasses();
      const classList = Array.isArray(classesData) ? classesData : classesData.data || [];
      setClasses(classList);
      
      if (classList.length > 0) {
        setSelectedClass(classList[0]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassGrades = async () => {
    try {
      const params = { classId: selectedClass._id };
      if (selectedTerm !== 'all') params.term = selectedTerm;
      if (selectedExamType !== 'all') params.examType = selectedExamType;

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

  const getExamTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'quiz': return 'help-circle';
      case 'midterm': return 'document-text';
      case 'final': return 'trophy';
      case 'assignment': return 'create';
      case 'project': return 'folder';
      case 'practical': return 'flask';
      default: return 'document';
    }
  };

  // Group grades by student
  const groupedGrades = grades.reduce((acc, grade) => {
    const studentId = grade.student?._id || grade.student;
    const studentName = grade.student?.firstName && grade.student?.lastName
      ? `${grade.student.firstName} ${grade.student.lastName}`
      : grade.student?.name || 'Unknown Student';
    const studentIdNumber = grade.student?.studentId || 'N/A';

    if (!acc[studentId]) {
      acc[studentId] = {
        studentId: studentId,
        studentName: studentName,
        studentIdNumber: studentIdNumber,
        grades: [],
      };
    }
    acc[studentId].grades.push(grade);
    return acc;
  }, {});

  const studentGradesList = Object.values(groupedGrades);

  if (loading) {
    return <Loading message="Loading class grades..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class Grade History</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Class Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.classSelector}
        >
          {classes.map((cls) => (
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
            <Text style={styles.statsTitle}>Class Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={28} color={colors.primary} />
                <Text style={styles.statValue}>{classStats.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="school" size={28} color={colors.success} />
                <Text style={styles.statValue}>{classStats.averagePercentage?.toFixed(1) || 0}%</Text>
                <Text style={styles.statLabel}>Class Average</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={28} color={colors.warning} />
                <Text style={styles.statValue}>{classStats.highestPercentage?.toFixed(1) || 0}%</Text>
                <Text style={styles.statLabel}>Highest</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-down" size={28} color={colors.error} />
                <Text style={styles.statValue}>{classStats.lowestPercentage?.toFixed(1) || 0}%</Text>
                <Text style={styles.statLabel}>Lowest</Text>
              </View>
            </View>
          </CustomCard>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Term Filter */}
          <Text style={styles.filterLabel}>Term:</Text>
          <View style={styles.filterRow}>
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
                  {term === 'all' ? 'All' : term}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exam Type Filter */}
          <Text style={styles.filterLabel}>Exam Type:</Text>
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'quiz', 'midterm', 'final', 'assignment', 'project', 'practical'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedExamType === type && styles.filterChipActive,
                    { marginRight: spacing.xs }
                  ]}
                  onPress={() => setSelectedExamType(type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedExamType === type && styles.filterChipTextActive
                  ]}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Results Summary */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Showing {grades.length} result{grades.length !== 1 ? 's' : ''} for {selectedClass?.className}
          </Text>
        </View>

        {/* Grades by Student */}
        {studentGradesList.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {studentGradesList.map((studentData) => (
              <CustomCard key={studentData.studentId} style={styles.studentCard}>
                {/* Student Header */}
                <View style={styles.studentHeader}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>
                      {studentData.studentName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{studentData.studentName}</Text>
                    <Text style={styles.studentId}>ID: {studentData.studentIdNumber}</Text>
                  </View>
                  <View style={styles.gradesSummary}>
                    <Text style={styles.gradesCount}>{studentData.grades.length}</Text>
                    <Text style={styles.gradesLabel}>Result{studentData.grades.length !== 1 ? 's' : ''}</Text>
                  </View>
                </View>

                {/* Student's Grades */}
                <View style={styles.gradesContainer}>
                  {studentData.grades.map((grade) => (
                    <View key={grade._id} style={styles.gradeRow}>
                      <View style={styles.gradeLeft}>
                        <View style={[
                          styles.examIcon,
                          { backgroundColor: getGradeColor(grade.grade) + '20' }
                        ]}>
                          <Ionicons
                            name={getExamTypeIcon(grade.examType)}
                            size={20}
                            color={getGradeColor(grade.grade)}
                          />
                        </View>
                        <View style={styles.gradeDetails}>
                          <Text style={styles.examName}>{grade.examName}</Text>
                          <View style={styles.gradeMetaRow}>
                            <Text style={styles.subjectName}>
                              {typeof grade.subject === 'object' ? grade.subject.subjectName : grade.subject}
                            </Text>
                            <Text style={styles.metaDot}>•</Text>
                            <Text style={styles.examType}>{grade.examType}</Text>
                            <Text style={styles.metaDot}>•</Text>
                            <Text style={styles.termText}>{grade.term}</Text>
                          </View>
                          {grade.examDate && (
                            <Text style={styles.dateText}>
                              {format(new Date(grade.examDate), 'MMM dd, yyyy')}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.gradeRight}>
                        <View style={[
                          styles.gradeBadge,
                          { backgroundColor: getGradeColor(grade.grade) }
                        ]}>
                          <Text style={styles.gradeBadgeText}>{grade.grade}</Text>
                        </View>
                        <Text style={styles.marksText}>
                          {grade.marksObtained}/{grade.totalMarks}
                        </Text>
                        <Text style={[
                          styles.percentageText,
                          { color: getGradeColor(grade.grade) }
                        ]}>
                          {grade.percentage?.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Student Average */}
                <View style={styles.studentAverage}>
                  <Text style={styles.averageLabel}>Student Average:</Text>
                  <Text style={styles.averageValue}>
                    {(studentData.grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / studentData.grades.length).toFixed(2)}%
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
                ? `No grades available for ${selectedClass.className} with current filters`
                : "Select a class to view grade history"
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
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
  summaryBar: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  studentCard: {
    marginBottom: spacing.md,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  studentId: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  gradesSummary: {
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  gradesCount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  gradesLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  gradesContainer: {
    gap: spacing.sm,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray50,
  },
  gradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  examIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  gradeDetails: {
    flex: 1,
  },
  examName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  gradeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs / 2,
  },
  subjectName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  examType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  termText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  gradeRight: {
    alignItems: 'center',
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  gradeBadgeText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  marksText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 4,
  },
  percentageText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  studentAverage: {
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

export default ClassGradeHistoryScreen;

