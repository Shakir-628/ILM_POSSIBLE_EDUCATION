import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
    Dimensions,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { API_URL } from '../../utils/constants';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import CurvedHeader from '../../components/CurvedHeader';
import CustomCard from '../../components/CustomCard';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { parentService } from '../../services/parentService';
import { examService } from '../../services/examService';
import { feeService } from '../../services/feeService';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import { useDesignSystem, getStatusColor, colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../utils/designSystem';

const { width } = Dimensions.get('window');

const StudentDetailScreen = ({ route, navigation }) => {
    const { studentId, student: initialStudent } = route.params || {};
    const toast = useToast();
    const { colors, spacing, fontSize, fontWeight, borderRadius, shadows, isDarkMode } = useDesignSystem();
    const [student, setStudent] = useState(initialStudent);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [stats, setStats] = useState({
        attendance: 0,
        assignments: 0,
        averageGrade: 0,
        pendingFees: 0,
    });

    const [feeHistory, setFeeHistory] = useState([]);
    const [examSchedules, setExamSchedules] = useState([]);
    const [gradeHistory, setGradeHistory] = useState([]);

    useEffect(() => {
        if (studentId || initialStudent) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            let currentStudent = student;
            const targetId = studentId || student?._id || student?.studentId;

            if (!currentStudent && targetId) {
                const res = await studentService.getStudentById(targetId);
                currentStudent = res.data || res;
                setStudent(currentStudent);
            }

            if (!currentStudent) {
                toast.error('Student information not found');
                return;
            }

            const actualStudentId = currentStudent._id || currentStudent.studentId;
            const classId = currentStudent.class?._id || currentStudent.class;

            const [attendanceData, assignmentsData, gradesData, feesData, examsData] = await Promise.all([
                parentService.getChildAttendance(actualStudentId).catch(() => ({ percentage: 0 })),
                parentService.getChildAssignments(actualStudentId).catch(() => []),
                gradeService.getStudentGrades(actualStudentId).catch(() => []),
                feeService.getStudentFees(actualStudentId).catch(() => ({ data: [], totalPending: 0 })),
                examService.getExamSchedulesByClass(classId).catch(() => [])
            ]);

            const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [];
            const grades = Array.isArray(gradesData) ? gradesData : gradesData.data || [];
            const fees = Array.isArray(feesData.data) ? feesData.data : (Array.isArray(feesData) ? feesData : []);
            const exams = Array.isArray(examsData) ? examsData : examsData.data || [];

            const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
            const averageGrade = grades.length > 0
                ? (grades.reduce((sum, g) => sum + (g.marksObtained / g.totalMarks * 100), 0) / grades.length).toFixed(1)
                : 0;

            setStats({
                attendance: attendanceData.percentage || attendanceData.attendancePercentage || 0,
                assignments: pendingAssignments,
                averageGrade,
                pendingFees: feesData.totalPending || feesData.pending || 0,
            });

            setFeeHistory(fees);
            setGradeHistory(grades);
            setExamSchedules(exams);

        } catch (error) {
            console.error('Error fetching student data:', error);
            toast.error('Failed to load student data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateIDCard = async () => {
        try {
            setLoading(true);
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @page {
                        size: 432px 288px;
                        margin: 0;
                    }
                    body {
                        font-family: 'Helvetica', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: white;
                        width: 432px;
                        height: 288px;
                    }
                    .id-card {
                        width: 432px;
                        height: 288px;
                        background: #f0f9ff;
                        overflow: hidden;
                        position: relative;
                        border: 1px solid #0369a1;
                        box-sizing: border-box;
                    }
                    .header {
                        background: #0369a1;
                        height: 60px;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .school-name {
                        color: white;
                        font-size: 20px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .main-content {
                        display: flex;
                        padding: 20px;
                        gap: 20px;
                    }
                    .photo-container {
                        width: 100px;
                        height: 120px;
                        border: 1px solid #0369a1;
                        background: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                    }
                    .profile-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .placeholder-text {
                        color: #64748b;
                        font-size: 10px;
                    }
                    .info-column {
                        flex: 1;
                        text-align: left;
                    }
                    .detail-row {
                        display: flex;
                        margin-bottom: 8px;
                        font-size: 11px;
                    }
                    .label {
                        font-weight: bold;
                        color: #0f172a;
                        width: 80px;
                    }
                    .value {
                        color: #334155;
                        flex: 1;
                    }
                    .qr-code {
                        position: absolute;
                        bottom: 40px;
                        right: 20px;
                        width: 70px;
                        height: 70px;
                        background: white;
                        padding: 5px;
                        border: 1px solid #e2e8f0;
                    }
                    .footer {
                        position: absolute;
                        bottom: 0;
                        width: 100%;
                        padding: 5px 0;
                    }
                    .footer-text {
                        color: #64748b;
                        font-size: 8px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="id-card">
                    <div class="header">
                        <div class="school-name">ILM Possible Education</div>
                    </div>
                    
                    <div class="main-content">
                        <div class="photo-container">
                            ${student.profilePicture ?
                    `<img src="${student.profilePicture}" class="profile-img" />` :
                    `<span class="placeholder-text">PHOTO</span>`
                }
                        </div>
                        
                        <div class="info-column">
                           <div class="detail-row">
                                <span class="label">Student ID:</span>
                                <span class="value">${student.studentId}</span>
                           </div>
                           <div class="detail-row">
                                <span class="label">Name:</span>
                                <span class="value">${student.name}</span>
                           </div>
                           <div class="detail-row">
                                <span class="label">Class:</span>
                                <span class="value">${typeof student.class === 'object' ? student.class.className : student.class} (${student.section})</span>
                           </div>
                           <div class="detail-row">
                                <span class="label">DOB:</span>
                                <span class="value">${student.dateOfBirth ? format(new Date(student.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}</span>
                           </div>
                           <div class="detail-row">
                                <span class="label">Blood Group:</span>
                                <span class="value">${student.bloodGroup || 'N/A'}</span>
                           </div>
                           <div class="detail-row">
                                <span class="label">Contact:</span>
                                <span class="value">${student.phone || student.guardianPhone || 'N/A'}</span>
                           </div>
                        </div>
                    </div>

                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student.studentId}" class="qr-code" />

                    <div class="footer">
                        <div class="footer-text">In case of emergency, please contact: ${student.guardianPhone || 'N/A'}</div>
                        <div class="footer-text">www.ilmpossible.edu | contact@ilmpossible.edu</div>
                    </div>
                </div>
            </body>
            </html>
            `;

            if (Platform.OS === 'web') {
                // For web, use a more robust custom implementation to avoid 'message channel closed' errors
                // and ensure images (profile pic, QR code) are loaded before printing
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                const pri = iframe.contentWindow;
                pri.document.open();
                pri.document.write(html);
                pri.document.close();

                // Wait for images to load before printing
                const images = pri.document.getElementsByTagName('img');
                const totalImages = images.length;
                let loadedCount = 0;

                const triggerPrint = () => {
                    pri.focus();
                    pri.print();
                    // Cleanup after print dialog is closed
                    setTimeout(() => {
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                    }, 1000);
                };

                if (totalImages === 0) {
                    triggerPrint();
                } else {
                    // Set a safety timeout of 3 seconds
                    const safetyTimeout = setTimeout(triggerPrint, 3000);

                    for (let i = 0; i < images.length; i++) {
                        const img = images[i];
                        if (img.complete) {
                            loadedCount++;
                            if (loadedCount === totalImages) {
                                clearTimeout(safetyTimeout);
                                triggerPrint();
                            }
                        } else {
                            img.onload = () => {
                                loadedCount++;
                                if (loadedCount === totalImages) {
                                    clearTimeout(safetyTimeout);
                                    triggerPrint();
                                }
                            };
                            img.onerror = () => {
                                loadedCount++;
                                if (loadedCount === totalImages) {
                                    clearTimeout(safetyTimeout);
                                    triggerPrint();
                                }
                            };
                        }
                    }
                }
            } else {
                const { uri } = await Print.printToFileAsync({ html, width: 432, height: 288 });
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }

        } catch (error) {
            console.error('Error generating ID card:', error);
            toast.error('Failed to generate ID card');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadIDCard = async () => {
        try {
            setLoading(true);
            const studentId = student._id || student.studentId;
            const token = await storage.getItem(STORAGE_KEYS.TOKEN);
            const filename = `${student.studentId}_ID_Card.pdf`;

            if (Platform.OS === 'web') {
                const response = await studentService.downloadIDCard(studentId);
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('ID Card downloaded');
            } else {
                const fileUri = `${FileSystem.cacheDirectory}${filename}`;
                const downloadRes = await FileSystem.downloadAsync(
                    `${API_URL}/students/${studentId}/id-card`,
                    fileUri,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (downloadRes.status === 200) {
                    await Sharing.shareAsync(downloadRes.uri, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Download Student ID Card',
                        UTI: 'com.adobe.pdf'
                    });
                } else {
                    throw new Error('Download failed');
                }
            }
        } catch (error) {
            console.error('Error downloading ID card:', error);
            toast.error('Failed to download ID card');
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return renderProfile();
            case 'fees':
                return renderFees();
            case 'exams':
                return renderExams();
            case 'results':
                return renderResults();
            default:
                return renderProfile();
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        if (typeof address === 'string') return address;
        const { street, city, state, country } = address;
        const parts = [street, city, state, country].filter(part => !!part);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const renderProfile = () => (
        <View>
            <Text style={styles.sectionTitle}>Stats Overview</Text>
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
                    title="Fees Due"
                    value={`PKR ${stats.pendingFees}`}
                    icon="cash"
                    color="red"
                />
            </View>

            <View style={styles.idCardActions}>
                <InteractiveButton
                    style={[styles.idCardBtn, { flex: 1.2, backgroundColor: colors.primary }]}
                    onPress={generateIDCard}
                >
                    <Ionicons name="card" size={20} color={colors.white} />
                    <Text style={[styles.idCardBtnText, { color: colors.white }]}>Preview Card</Text>
                </InteractiveButton>

                <InteractiveButton
                    style={[styles.idCardBtn, styles.downloadBtn, { flex: 1, borderColor: colors.primary }]}
                    onPress={handleDownloadIDCard}
                >
                    <Ionicons name="cloud-download" size={20} color={colors.primary} />
                    <Text style={[styles.idCardBtnText, styles.downloadBtnText, { color: colors.primary }]}>Save PDF</Text>
                </InteractiveButton>
            </View>

            <Text style={styles.sectionTitle}>Personal Information</Text>
            <CustomCard>
                <InfoRow label="Full Name" value={student.name || 'N/A'} icon="person-outline" />
                <InfoRow label="Student ID" value={student.studentId} icon="id-card-outline" />
                <InfoRow
                    label="Class"
                    value={`${typeof student.class === 'object' ? student.class?.className || 'N/A' : student.class || 'N/A'} ${student.section || ''}`}
                    icon="school-outline"
                />
                <InfoRow label="Email" value={student.email} icon="mail-outline" />
                <InfoRow label="Phone" value={student.phone || 'N/A'} icon="call-outline" />
                <InfoRow label="Address" value={formatAddress(student.address)} icon="location-outline" />
                <InfoRow label="Join Date" value={student.createdAt ? format(new Date(student.createdAt), 'dd MMM yyyy') : 'N/A'} icon="calendar-outline" />
                <InfoRow label="Status" value={student.status} icon="shield-checkmark-outline" isStatus />
            </CustomCard>
        </View>
    );

    const renderFees = () => {
        const hasPending = stats.pendingFees > 0;

        return (
            <View>
                <View style={[
                    styles.feeHighlight,
                    {
                        backgroundColor: hasPending ? '#fff1f2' : '#f0fdf4',
                        borderColor: hasPending ? '#fecdd3' : '#bbf7d0'
                    }
                ]}>
                    <Text style={[styles.feeLabel, { color: hasPending ? colors.error : colors.success }]}>
                        {hasPending ? 'Total Pending' : 'No Outstanding Balance'}
                    </Text>
                    <Text style={[styles.feeAmount, { color: hasPending ? colors.error : colors.success }]}>
                        PKR {stats.pendingFees}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Payment History</Text>
                {feeHistory.length === 0 ? (
                    <EmptyState
                        icon="cash-outline"
                        title="No Fee History"
                        message="No payment records found for this student."
                    />
                ) : (
                    feeHistory.map((fee, index) => (
                        <CustomCard key={fee._id || index} style={styles.feeCard}>
                            <View style={styles.feeHeader}>
                                <Text style={styles.feeTitle}>{fee.title || 'Tuition Fee'}</Text>
                                <Text style={[styles.feeStatus, { color: fee.status === 'paid' ? colors.success : colors.error }]}>
                                    {fee.status?.toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <View>
                                    <Text style={styles.feeSubLabel}>Date</Text>
                                    <Text style={styles.feeSubValue}>{fee.paymentDate ? format(new Date(fee.paymentDate), 'dd MMM yyyy') : 'N/A'}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.feeSubLabel}>Amount</Text>
                                    <Text style={styles.feeSubValue}>PKR {fee.amount}</Text>
                                </View>
                            </View>
                        </CustomCard>
                    ))
                )}
            </View>
        );
    };

    const renderExams = () => (
        <View>
            <Text style={styles.sectionTitle}>Upcoming Exams</Text>
            {examSchedules.length === 0 ? (
                <EmptyState
                    icon="calendar-outline"
                    title="No Exam Schedule"
                    message="No upcoming exams scheduled for this class."
                />
            ) : (
                examSchedules.map((exam, index) => (
                    <CustomCard key={exam._id || index} style={styles.examCard}>
                        <View style={styles.examHeader}>
                            <Text style={styles.examTitle}>{exam.examName}</Text>
                            <View style={styles.examBadge}>
                                <Text style={styles.examBadgeText}>{exam.examType}</Text>
                            </View>
                        </View>
                        <View style={styles.examList}>
                            {exam.schedule?.map((item, idx) => (
                                <View key={idx} style={styles.examRow}>
                                    <View style={styles.examDateBox}>
                                        <Text style={styles.dateDay}>{format(new Date(item.examDate), 'dd')}</Text>
                                        <Text style={styles.dateMonth}>{format(new Date(item.examDate), 'MMM')}</Text>
                                    </View>
                                    <View style={styles.examInfo}>
                                        <Text style={styles.subjectName}>
                                            {item.subject?.subjectName || item.subject?.name || (typeof item.subject === 'string' ? item.subject : 'N/A')}
                                        </Text>
                                        <Text style={styles.examTime}>{item.startTime} - {item.endTime}</Text>
                                    </View>
                                    <View style={styles.roomInfo}>
                                        <Text style={styles.roomLabel}>Room</Text>
                                        <Text style={styles.roomValue}>{item.roomNumber || 'A1'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </CustomCard>
                ))
            )}
        </View>
    );

    const renderResults = () => (
        <View>
            <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                    <Text style={styles.resStatVal}>{stats.averageGrade}%</Text>
                    <Text style={styles.resStatLab}>Average Grade</Text>
                </View>
                <View style={styles.resultStat}>
                    <Text style={[styles.resStatVal, { color: colors.primary }]}>{gradeHistory.length}</Text>
                    <Text style={styles.resStatLab}>Exams Taken</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Grade History</Text>
            {gradeHistory.length === 0 ? (
                <EmptyState
                    icon="school-outline"
                    title="No Results Yet"
                    message="Results will appear here once exams are graded."
                />
            ) : (
                gradeHistory.map((grade, index) => (
                    <CustomCard key={grade._id || index} style={styles.resultCard}>
                        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade.grade) }]}>
                            <Text style={styles.gradeText}>{grade.grade}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultSubject}>
                                {grade.subject?.subjectName || grade.subject?.name || (typeof grade.subject === 'string' ? grade.subject : 'N/A')}
                            </Text>
                            <Text style={styles.resultExam}>{grade.examName}</Text>
                            <Text style={styles.resultDate}>{format(new Date(grade.examDate), 'dd MMMM yyyy')}</Text>
                        </View>
                        <View style={styles.marksInfo}>
                            <Text style={styles.marksObtained}>{grade.marksObtained}</Text>
                            <Text style={styles.totalMarks}>/ {grade.totalMarks}</Text>
                        </View>
                    </CustomCard>
                ))
            )}
        </View>
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudentData();
    };

    if (loading) return <Loading message="Loading student details..." />;
    if (!student) return <EmptyState title="Student Not Found" message="Could not find student profile" />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CurvedHeader
                title={student.name ? (isDarkMode ? student.name : `Hi, ${student.name.split(' ')[0]}! 👋`) : 'Student Profile'}
                subtitle={isDarkMode ? `${student.studentId} • ${typeof student.class === 'object' ? student.class?.className : student.class}` : `Details for ${student.studentId}`}
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            {/* Premium Profile Overlay */}
            <View style={styles.profileHeaderOverlay}>
                <View style={[styles.avatarWrapper, shadows.medium, { borderColor: colors.cardBackground }]}>
                    <Image
                        source={{ uri: student.profilePicture || `https://ui-avatars.com/api/?name=${student.name}&background=random&size=200` }}
                        style={styles.profileImage}
                    />
                </View>
                <View style={styles.headerInfoText}>
                    <Text style={[styles.headerName, { color: colors.textPrimary }]}>{student.name}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(student.status) }]} />
                        <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>{student.status?.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.tabBar, { backgroundColor: colors.cardBackground, borderBottomColor: isDarkMode ? colors.gray800 : colors.gray100 }]}>
                <TabItem label="Profile" icon="person" active={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
                <TabItem label="Fees" icon="cash" active={activeTab === 'fees'} onPress={() => setActiveTab('fees')} />
                <TabItem label="Exams" icon="calendar" active={activeTab === 'exams'} onPress={() => setActiveTab('exams')} />
                <TabItem label="Results" icon="ribbon" active={activeTab === 'results'} onPress={() => setActiveTab('results')} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {renderTabContent()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// Sub-components
const TabItem = ({ label, icon, active, onPress }) => {
    const { colors } = useDesignSystem();
    return (
        <TouchableOpacity
            style={[styles.tabItem, active && { borderBottomColor: colors.primary }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={active ? icon : `${icon}-outline`} size={20} color={active ? colors.primary : colors.gray500} />
            <Text style={[styles.tabLabel, active && { color: colors.primary }]}>{label}</Text>
        </TouchableOpacity>
    );
};

const InteractiveButton = ({ children, style, onPress, ...props }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const flattenedStyle = StyleSheet.flatten(style) || {};

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 40,
            friction: 3
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 40,
            friction: 3
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }], flex: flattenedStyle.flex }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.9}
                style={[style, { flex: 1 }]}
                {...props}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

const InfoRow = ({ label, value, icon, isStatus }) => {
    const { colors } = useDesignSystem();
    return (
        <View style={[styles.infoRow, { borderBottomColor: colors.gray100 }]}>
            <View style={styles.infoLabelGroup}>
                {icon && <Ionicons name={icon} size={18} color={colors.gray400} style={styles.rowIcon} />}
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
            {isStatus ? (
                <View style={[styles.statusBadge, {
                    backgroundColor: getStatusColor(value) + '20'
                }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(value) }]}>{value?.toUpperCase()}</Text>
                </View>
            ) : (
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
            )}
        </View>
    );
};

const getGradeColor = (grade) => {
    switch (grade) {
        case 'A+': case 'A': return colors.success;
        case 'B+': case 'B': return colors.primary;
        case 'C+': case 'C': return colors.warning;
        case 'D': return '#ea580c';
        case 'F': return colors.error;
        default: return colors.gray500;
    }
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg },
    profileHeaderOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: -55,
        marginBottom: 20,
        zIndex: 10,
    },
    avatarWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    headerInfoText: {
        marginLeft: 16,
        marginTop: 50,
        flex: 1,
    },
    headerName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    headerStatus: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    idCardActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    idCardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        ...shadows.small,
    },
    downloadBtn: {
        borderWidth: 1,
    },
    idCardBtnText: { fontWeight: 'bold', fontSize: 13 },
    downloadBtnText: {},
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    infoLabel: { fontSize: 14, fontWeight: '500' },
    infoLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        marginRight: 10,
    },
    infoValue: { fontSize: 14, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '800' },

    // Fee Styles
    feeHighlight: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 20,
    },
    feeLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    feeAmount: { fontSize: 32, fontWeight: '800', marginTop: 4 },
    feeCard: { marginBottom: 12 },
    feeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    feeTitle: { fontSize: 16, fontWeight: 'bold' },
    feeStatus: { fontSize: 12, fontWeight: '800' },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    feeSubLabel: { fontSize: 11 },
    feeSubValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },

    // Exam Styles
    examCard: { marginBottom: 16, padding: 0, overflow: 'hidden' },
    examHeader: { padding: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
    examTitle: { fontSize: 16, fontWeight: 'bold' },
    examBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    examBadgeText: { fontSize: 10, fontWeight: '800' },
    examList: { padding: 16 },
    examRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    examDateBox: { width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    dateDay: { fontSize: 20, fontWeight: 'bold' },
    dateMonth: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    examInfo: { flex: 1, marginLeft: 16 },
    subjectName: { fontSize: 16, fontWeight: 'bold' },
    examTime: { fontSize: 13, marginTop: 2 },
    roomInfo: { alignItems: 'flex-end' },
    roomLabel: { fontSize: 10 },
    roomValue: { fontSize: 14, fontWeight: 'bold' },

    // Result Styles
    resultStats: { flexDirection: 'row', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    resultStat: { flex: 1, alignItems: 'center' },
    resStatVal: { fontSize: 28, fontWeight: '800' },
    resStatLab: { fontSize: 12, marginTop: 4, fontWeight: '600' },
    resultCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 16, borderRadius: 16 },
    gradeBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    gradeText: { fontWeight: '900', fontSize: 18 },
    resultInfo: { flex: 1, marginLeft: 16 },
    resultSubject: { fontSize: 16, fontWeight: 'bold' },
    resultExam: { fontSize: 13, marginTop: 2 },
    resultDate: { fontSize: 12, marginTop: 2 },
    marksInfo: { alignItems: 'flex-end' },
    marksObtained: { fontSize: 20, fontWeight: 'bold' },
    totalMarks: { fontSize: 13 },
});

export default StudentDetailScreen;
