import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import CustomCard from '../../components/CustomCard';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';
import { colors, spacing, borderRadius, fontSize, styles as designSystem } from '../../utils/designSystem';

const StudentDetailScreen = ({ route, navigation }) => {
    const { student } = route.params || {};
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        attendance: 0,
        assignments: 0,
        averageGrade: 0,
        pendingFees: 0,
    });

    useEffect(() => {
        if (student) {
            fetchStudentData();
        }
    }, [student]);

    const fetchStudentData = async () => {
        try {
            // Use parentService for now as it exposes same endpoints for fetching specific student data
            // In a real app, might want a specific adminService or studentService method if logic differs
            const [attendanceData, assignmentsData, gradesData, feesData] = await Promise.all([
                parentService.getChildAttendance(student._id || student.studentId).catch(() => ({ percentage: 0 })),
                parentService.getChildAssignments(student._id || student.studentId).catch(() => []),
                parentService.getChildGrades(student._id || student.studentId).catch(() => []),
                parentService.getChildFees(student._id || student.studentId).catch(() => ({ pending: 0 })),
            ]);

            const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [];
            const grades = Array.isArray(gradesData) ? gradesData : gradesData.data || [];

            const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
            const averageGrade = grades.length > 0
                ? (grades.reduce((sum, g) => sum + (g.marksObtained / g.totalMarks * 100), 0) / grades.length).toFixed(1)
                : 0;

            setStats({
                attendance: attendanceData.percentage || attendanceData.attendancePercentage || 0,
                assignments: pendingAssignments,
                averageGrade,
                pendingFees: feesData.pending || feesData.totalPending || 0,
            });
        } catch (error) {
            console.error('Error fetching student data:', error);
            toast.error('Failed to load student data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudentData();
    };

    if (!student) {
        return (
            <View style={styles.container}>
                <Text>No Student Data Provided</Text>
            </View>
        )
    }

    if (loading) {
        return <Loading message="Loading student details..." />;
    }

    return (
        <View style={styles.container}>
            <GradientHeader
                title={student.name}
                subtitle={`${student.studentId} • ${typeof student.class === 'object' ? student.class?.className : student.class} ${student.section}`}
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Overview */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Attendance"
                            value={`${stats.attendance}%`}
                            icon="calendar"
                            color="blue"
                        />
                        <StatCard
                            title="Avg Grade"
                            value={`${stats.averageGrade}%`}
                            icon="trophy"
                            color="green"
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Assignments"
                            value={stats.assignments.toString()}
                            icon="document-text"
                            color="orange"
                        />
                        <StatCard
                            title="Pending Fees"
                            value={`PKR ${stats.pendingFees}`}
                            icon="cash"
                            color="red"
                        />
                    </View>
                </View>

                {/* Student Information */}
                <Text style={styles.sectionTitle}>Student Information</Text>
                <CustomCard>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{student.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Student ID</Text>
                        <Text style={styles.infoValue}>{student.studentId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Class</Text>
                        <Text style={styles.infoValue}>
                            {typeof student.class === 'object' ? student.class?.className : student.class} {student.section}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{student.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <View style={[styles.statusBadge, {
                            backgroundColor: student.status === 'active' ? colors.success : colors.error
                        }]}>
                            <Text style={styles.statusText}>
                                {student.status === 'active' ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>
                </CustomCard>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
    },
    statsContainer: {
        marginBottom: spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    infoLabel: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: fontSize.base,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.white,
    },
});

export default StudentDetailScreen;
