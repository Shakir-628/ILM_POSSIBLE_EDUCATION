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
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';

const GradesScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grades, setGrades] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [stats, setStats] = useState({
    totalSubjects: 0,
    averagePercentage: 0,
    totalMarks: 0,
    obtainedMarks: 0,
    grade: 'N/A',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [grades, selectedTerm]);

  const fetchGrades = async () => {
    try {
      const gradesData = await gradeService.getMyGrades();
      setGrades(Array.isArray(gradesData) ? gradesData : gradesData.data || []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = () => {
    let filteredGrades = grades;
    if (selectedTerm !== 'all') {
      filteredGrades = grades.filter(g => g.term === selectedTerm);
    }

    if (filteredGrades.length === 0) {
      setStats({
        totalSubjects: 0,
        averagePercentage: 0,
        totalMarks: 0,
        obtainedMarks: 0,
        grade: 'N/A',
      });
      return;
    }

    const totalMarks = filteredGrades.reduce((sum, g) => sum + (g.totalMarks || 0), 0);
    const obtainedMarks = filteredGrades.reduce((sum, g) => sum + (g.marksObtained || 0), 0);
    const averagePercentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

    setStats({
      totalSubjects: filteredGrades.length,
      averagePercentage,
      totalMarks,
      obtainedMarks,
      grade: getOverallGrade(averagePercentage),
    });
  };

  const getOverallGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return colors.success;
    if (grade === 'B') return colors.info;
    if (grade === 'C') return colors.warning;
    return colors.error;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrades();
  };

  if (loading) {
    return <Loading message="Loading grades..." />;
  }

  const filteredGrades = selectedTerm === 'all' 
    ? grades 
    : grades.filter(g => g.term === selectedTerm);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.header}>
        <Text style={styles.headerTitle}>My Grades</Text>
        <Text style={styles.headerSubtitle}>Academic Performance</Text>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Stats Card */}
        <CustomCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSubjects}</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getGradeColor(stats.grade) }]}>
                {stats.grade}
              </Text>
              <Text style={styles.statLabel}>Overall Grade</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averagePercentage}%</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
          </View>
          <View style={styles.marksRow}>
            <Text style={styles.marksText}>
              Total Marks: <Text style={styles.marksBold}>{stats.obtainedMarks}/{stats.totalMarks}</Text>
            </Text>
          </View>
        </CustomCard>

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

        {/* Grades List */}
        {filteredGrades.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredGrades.map((grade) => (
              <CustomCard key={grade._id} style={styles.gradeCard}>
                <View style={styles.gradeHeader}>
                  <View style={styles.subjectInfo}>
                    <View style={[
                      styles.subjectIcon,
                      { backgroundColor: getGradeColor(grade.grade) + '20' }
                    ]}>
                      <Ionicons 
                        name="book" 
                        size={24} 
                        color={getGradeColor(grade.grade)} 
                      />
                    </View>
                    <View style={styles.subjectDetails}>
                      <Text style={styles.subjectName}>
                        {typeof grade.subject === 'object' ? grade.subject.name : grade.subject}
                      </Text>
                      <Text style={styles.examInfo}>
                        {grade.examType} • {grade.term} Term
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.gradeBadge,
                    { backgroundColor: getGradeColor(grade.grade) }
                  ]}>
                    <Text style={styles.gradeText}>{grade.grade}</Text>
                  </View>
                </View>

                <View style={styles.gradeBody}>
                  <View style={styles.marksContainer}>
                    <View style={styles.markRow}>
                      <Text style={styles.markLabel}>Marks Obtained:</Text>
                      <Text style={styles.markValue}>{grade.marksObtained}</Text>
                    </View>
                    <View style={styles.markRow}>
                      <Text style={styles.markLabel}>Total Marks:</Text>
                      <Text style={styles.markValue}>{grade.totalMarks}</Text>
                    </View>
                    <View style={[styles.markRow, styles.percentageRow]}>
                      <Text style={styles.percentageLabel}>Percentage:</Text>
                      <Text style={[
                        styles.percentageValue,
                        { color: getGradeColor(grade.grade) }
                      ]}>
                        {((grade.marksObtained / grade.totalMarks) * 100).toFixed(2)}%
                      </Text>
                    </View>
                  </View>

                  {grade.remarks && (
                    <View style={styles.remarksContainer}>
                      <Ionicons name="chatbox-ellipses-outline" size={16} color={colors.gray500} />
                      <Text style={styles.remarksText}>{grade.remarks}</Text>
                    </View>
                  )}

                  {grade.gradedBy && (
                    <Text style={styles.teacherText}>
                      Graded by: {typeof grade.gradedBy === 'object' ? grade.gradedBy.name : grade.gradedBy}
                    </Text>
                  )}
                </View>
              </CustomCard>
            ))}
          </Animated.View>
        ) : (
          <EmptyState
            icon="school-outline"
            title="No Grades Yet"
            message={selectedTerm === 'all' ? 
              "Your grades will appear here once published by teachers" :
              `No grades available for ${selectedTerm} term`
            }
          />
        )}

        {/* Download Report Card Button */}
        {grades.length > 0 && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => toast.info('Report card download coming soon')}
          >
            <Ionicons name="download-outline" size={20} color={colors.white} />
            <Text style={styles.downloadButtonText}>Download Report Card</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: spacing.lg,
  },
  statsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary + '10',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray200,
  },
  marksRow: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    alignItems: 'center',
  },
  marksText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  marksBold: {
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontSize: fontSize.lg,
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
  gradeCard: {
    marginBottom: spacing.md,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  examInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  gradeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  gradeBody: {
    gap: spacing.md,
  },
  marksContainer: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  markLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  markValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  percentageRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  percentageLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  percentageValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  remarksText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  teacherText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  downloadButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

export default GradesScreen;
