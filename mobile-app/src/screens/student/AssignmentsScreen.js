import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Animated, 
  Modal, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import CustomCard from '../../components/CustomCard';
import CustomButton from '../../components/CustomButton';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { assignmentService } from '../../services/assignmentService';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';

const AssignmentsScreen = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, submitted
  
  // Submission Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment._id);
      formData.append('files', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      });

      await assignmentService.submitAssignment(formData);
      
      toast.success('Assignment submitted successfully');
      setModalVisible(false);
      setSelectedFile(null);
      fetchAssignments(); // Refresh list
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
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
                      <Text style={styles.detailText}>{assignment.subject?.subjectName || 'General'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {!assignment.submitted && (
                    <CustomButton
                      title="Submit Now"
                      onPress={() => {
                        setSelectedAssignment(assignment);
                        setModalVisible(true);
                      }}
                      size="small"
                      fullWidth
                      icon="cloud-upload-outline"
                      style={styles.submitButton}
                    />
                  )}
                  
                  {assignment.submitted && assignment.grade && (
                    <View style={styles.gradeInfo}>
                      <Text style={styles.gradeLabel}>Grade: </Text>
                      <Text style={styles.gradeValue}>{assignment.grade}/{assignment.totalMarks}</Text>
                    </View>
                  )}
                </View>
              </CustomCard>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Submission Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Assignment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalAssignmentTitle}>{selectedAssignment?.title}</Text>
            
            <TouchableOpacity 
              style={styles.filePicker} 
              onPress={handlePickDocument}
              disabled={uploading}
            >
              <Ionicons 
                name={selectedFile ? "document-attach" : "cloud-upload-outline"} 
                size={40} 
                color={selectedFile ? colors.success : colors.primary} 
              />
              <Text style={styles.filePickerText}>
                {selectedFile ? selectedFile.name : "Select Document/PDF/Image"}
              </Text>
              {selectedFile && (
                <Text style={styles.fileSize}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
                disabled={uploading}
              />
              <CustomButton
                title={uploading ? "Uploading..." : "Submit"}
                onPress={handleSubmitAssignment}
                style={{ flex: 1 }}
                loading={uploading}
                disabled={!selectedFile || uploading}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  gradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  gradeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  gradeValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  modalAssignmentTitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  filePicker: {
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  filePickerText: {
    marginTop: 10,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: fontSize.xs,
    color: colors.gray400,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
  },
});

export default AssignmentsScreen;
