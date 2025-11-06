import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import CustomButton from '../../components/CustomButton';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { assignmentService } from '../../services/assignmentService';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients, getStatusColor } from '../../utils/designSystem';
import { format } from 'date-fns';

const AssignmentsScreen = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, submitted
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentService.getMyAssignments();
      setAssignments(Array.isArray(data) ? data : data.data || []);

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
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !a.submitted;
    if (filter === 'submitted') return a.submitted;
    return true;
  });

  const getAssignmentStatusColor = (assignment) => {
    if (assignment.submitted) return colors.success;
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    if (dueDate < now) return colors.error;
    return colors.warning;
  };

  const getStatusText = (assignment) => {
    if (assignment.submitted) return 'Submitted';
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    if (dueDate < now) return 'Overdue';
    return 'Pending';
  };

  if (loading) {
    return <Loading message="Loading assignments..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={gradients.warning} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="document-text" size={40} color={colors.white} />
          <Text style={styles.headerTitle}>My Assignments</Text>
          <Text style={styles.headerSubtitle}>
            {assignments.filter(a => !a.submitted).length} pending • {assignments.filter(a => a.submitted).length} submitted
          </Text>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
        {['all', 'pending', 'submitted'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({assignments.filter(a => {
                if (f === 'all') return true;
                if (f === 'pending') return !a.submitted;
                if (f === 'submitted') return a.submitted;
              }).length})
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.warning]} />
        }
      >
        {filteredAssignments.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No Assignments"
            message="You don't have any assignments yet"
          />
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {filteredAssignments.map((assignment, index) => (
              <CustomCard key={index} style={styles.assignmentCard}>
                <TouchableOpacity 
                  onPress={() => toast.info(`Viewing ${assignment.title}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.assignment}>
                    <View style={styles.assignmentHeader}>
                      <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getAssignmentStatusColor(assignment) },
                        ]}
                      >
                        <Text style={styles.statusText}>{getStatusText(assignment)}</Text>
                      </View>
                    </View>

                <Text style={styles.assignmentDesc} numberOfLines={2}>
                  {assignment.description}
                </Text>

                <View style={styles.assignmentDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="book-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{assignment.subject?.subjectName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="star-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{assignment.totalMarks} marks</Text>
                  </View>
                </View>

                {!assignment.submitted && (
                  <CustomButton
                    title="Submit Assignment"
                    onPress={() => toast.info('Use web app to submit files')}
                    size="small"
                    fullWidth
                    icon="cloud-upload-outline"
                    style={styles.submitButton}
                  />
                )}
              </View>
                </TouchableOpacity>
            </CustomCard>
            ))}
          </Animated.View>
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
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.9)',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    gap: spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  filterTabActive: {
    backgroundColor: colors.warning,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
  },
  assignmentCard: {
    marginBottom: spacing.md,
  },
  assignment: {
    // padding already in CustomCard
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  assignmentTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  assignmentDesc: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  assignmentDetails: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});

export default AssignmentsScreen;

