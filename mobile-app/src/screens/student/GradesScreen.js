import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import CustomCard from '../../components/CustomCard';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { gradeService } from '../../services/gradeService';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';

const GradesScreen = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grades, setGrades] = useState([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const data = await gradeService.getMyGrades();
      const gradesArray = Array.isArray(data) ? data : data.data || [];
      setGrades(gradesArray);

      // Calculate average
      if (gradesArray.length > 0) {
        const avg = gradesArray.reduce((sum, g) => {
          const percentage = (g.marksObtained / g.totalMarks) * 100;
          return sum + percentage;
        }, 0) / gradesArray.length;
        setAverage(avg.toFixed(1));
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrades();
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return <Loading message="Loading grades..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
      }
    >
      {/* Overall Stats */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Average Grade"
          value={`${average}%`}
          icon="trophy"
          color="purple"
        />
      </View>

      {/* Grades List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject-wise Grades</Text>
        {grades.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="No Grades Yet"
            message="Your grades will appear here once published"
          />
        ) : (
          grades.map((grade, index) => {
            const percentage = ((grade.marksObtained / grade.totalMarks) * 100).toFixed(1);
            return (
              <CustomCard key={index} style={styles.gradeCard}>
                <View style={styles.grade}>
                  <View style={styles.gradeHeader}>
                    <Text style={styles.subjectName}>{grade.subject?.subjectName}</Text>
                    <View style={[styles.percentageBadge, { backgroundColor: getGradeColor(percentage) }]}>
                      <Text style={styles.percentageText}>{percentage}%</Text>
                    </View>
                  </View>

                  <View style={styles.gradeDetails}>
                    <View style={styles.gradeDetailItem}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#6b7280" />
                      <Text style={styles.gradeDetailText}>
                        Obtained: {grade.marksObtained} / {grade.totalMarks}
                      </Text>
                    </View>
                    <View style={styles.gradeDetailItem}>
                      <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                      <Text style={styles.gradeDetailText}>
                        Exam: {grade.examType}
                      </Text>
                    </View>
                    <View style={styles.gradeDetailItem}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={styles.gradeDetailText}>
                        {new Date(grade.examDate || grade.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {grade.remarks && (
                    <View style={styles.remarksContainer}>
                      <Text style={styles.remarksLabel}>Remarks:</Text>
                      <Text style={styles.remarksText}>{grade.remarks}</Text>
                    </View>
                  )}
                </View>
              </CustomCard>
            );
          })
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  statsContainer: {
    padding: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  gradeCard: {
    marginBottom: 12,
  },
  grade: {
    padding: 4,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  percentageText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  gradeDetails: {
    marginBottom: 8,
  },
  gradeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gradeDetailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  remarksContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  remarksLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
  },
});

export default GradesScreen;

