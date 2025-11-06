import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format } from 'date-fns';

const FinanceScreen = ({ navigation }) => {
  const toast = useToast();
  const { isConnected, on, off } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending, overdue
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    totalStudents: 0,
    paidStudents: 0,
    pendingStudents: 0,
    overdueStudents: 0,
  });

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const autoRefreshInterval = useRef(null);

  useEffect(() => {
    fetchFinanceData();
    
    // Setup real-time socket listeners
    setupSocketListeners();
    
    // Setup auto-refresh every 30 seconds as backup
    if (autoRefreshEnabled) {
      autoRefreshInterval.current = setInterval(() => {
        fetchFinanceData(true); // true = silent refresh
      }, 30000); // 30 seconds
    }
    
    // Cleanup on unmount
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
      cleanupSocketListeners();
    };
  }, [autoRefreshEnabled]);

  const setupSocketListeners = () => {
    if (!isConnected) {
      console.log('Socket not connected, skipping listeners setup');
      return;
    }

    // Listen for fee-related events
    on('fee:created', handleFeeUpdate);
    on('fee:updated', handleFeeUpdate);
    on('fee:deleted', handleFeeUpdate);
    on('payment:received', handlePaymentReceived);
    on('student:updated', handleStudentUpdate);
    
    console.log('✅ Socket listeners setup for Finance screen');
  };

  const cleanupSocketListeners = () => {
    off('fee:created', handleFeeUpdate);
    off('fee:updated', handleFeeUpdate);
    off('fee:deleted', handleFeeUpdate);
    off('payment:received', handlePaymentReceived);
    off('student:updated', handleStudentUpdate);
    
    console.log('🧹 Socket listeners cleaned up for Finance screen');
  };

  const handleFeeUpdate = (data) => {
    console.log('💰 Fee update received:', data);
    toast.info('Payment records updated');
    fetchFinanceData(true); // Silent refresh
  };

  const handlePaymentReceived = (data) => {
    console.log('✅ Payment received:', data);
    toast.success(`Payment received: ${formatCurrency(data.amount)}`);
    fetchFinanceData(true); // Silent refresh
  };

  const handleStudentUpdate = (data) => {
    console.log('👨‍🎓 Student updated:', data);
    fetchFinanceData(true); // Silent refresh
  };

  useEffect(() => {
    filterStudents();
  }, [searchQuery, filterStatus, students]);

  const fetchFinanceData = async (silentRefresh = false) => {
    if (!silentRefresh) {
      // Only show loading on manual refresh
    }
    
    try {
      const studentsData = await studentService.getAllStudents();
      const studentsArray = Array.isArray(studentsData) ? studentsData : [];
      
      // Fetch fee information for each student
      const studentsWithFees = await Promise.all(
        studentsArray.map(async (student) => {
          try {
            const fees = await feeService.getStudentFees(student._id);
            const feesArray = Array.isArray(fees) ? fees : fees?.data || [];
            
            const totalAmount = feesArray.reduce((sum, fee) => sum + (fee.amount || 0), 0);
            const paidAmount = feesArray.reduce((sum, fee) => 
              fee.status === 'paid' ? sum + (fee.amount || 0) : sum, 0);
            const pendingAmount = totalAmount - paidAmount;
            
            // Check for overdue fees
            const hasOverdue = feesArray.some(fee => 
              fee.status === 'pending' && fee.dueDate && new Date(fee.dueDate) < new Date()
            );
            
            return {
              ...student,
              fees: feesArray,
              totalAmount,
              paidAmount,
              pendingAmount,
              feeStatus: hasOverdue ? 'overdue' : pendingAmount > 0 ? 'pending' : 'paid',
            };
          } catch (error) {
            console.error(`Error fetching fees for student ${student._id}:`, error);
            return {
              ...student,
              fees: [],
              totalAmount: 0,
              paidAmount: 0,
              pendingAmount: 0,
              feeStatus: 'paid',
            };
          }
        })
      );
      
      setStudents(studentsWithFees);
      
      // Calculate statistics
      const totalRevenue = studentsWithFees.reduce((sum, s) => sum + s.totalAmount, 0);
      const paidAmount = studentsWithFees.reduce((sum, s) => sum + s.paidAmount, 0);
      const pendingAmount = studentsWithFees.reduce((sum, s) => sum + s.pendingAmount, 0);
      const overdueAmount = studentsWithFees.reduce((sum, s) => 
        s.feeStatus === 'overdue' ? sum + s.pendingAmount : sum, 0);
      
      setStats({
        totalRevenue,
        paidAmount,
        pendingAmount,
        overdueAmount,
        totalStudents: studentsWithFees.length,
        paidStudents: studentsWithFees.filter(s => s.feeStatus === 'paid').length,
        pendingStudents: studentsWithFees.filter(s => s.feeStatus === 'pending').length,
        overdueStudents: studentsWithFees.filter(s => s.feeStatus === 'overdue').length,
      });
      
      // Update last refresh timestamp
      setLastUpdated(new Date());
      
      if (!silentRefresh) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
      
      // Show success toast only on manual refresh
      if (refreshing) {
        toast.success('Finance data updated');
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
      if (!silentRefresh) {
        toast.error('Failed to load finance data');
      }
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((student) => student.feeStatus === filterStatus);
    }

    setFilteredStudents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinanceData();
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount?.toLocaleString() || '0'}`;
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return format(date, 'MMM dd, hh:mm a');
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    toast.info(autoRefreshEnabled ? 'Auto-refresh disabled' : 'Auto-refresh enabled (every 30s)');
  };

  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  if (loading) {
    return <Loading message="Loading finance data..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Finance & Accounts</Text>
            {lastUpdated && (
              <View style={styles.updateInfo}>
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.9)" />
                <Text style={styles.updateText}>Updated {getTimeAgo(lastUpdated)}</Text>
                {(isConnected || autoRefreshEnabled) && (
                  <View style={styles.liveIndicator}>
                    <View style={[styles.liveDot, { 
                      backgroundColor: isConnected ? '#22C55E' : '#F59E0B' 
                    }]} />
                    <Text style={styles.liveText}>
                      {isConnected ? 'Live' : 'Auto'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={toggleAutoRefresh} 
              style={styles.iconButton}
            >
              <Ionicons 
                name={autoRefreshEnabled ? "pause-circle" : "play-circle"} 
                size={24} 
                color={colors.white} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setRefreshing(true);
                fetchFinanceData();
              }} 
              style={styles.iconButton}
            >
              <Ionicons name="refresh" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Financial Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="cash" size={32} color={colors.success} />
              <Text style={styles.summaryValue}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="checkmark-circle" size={32} color={colors.info} />
              <Text style={styles.summaryValue}>{formatCurrency(stats.paidAmount)}</Text>
              <Text style={styles.summaryLabel}>Paid Amount</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="time" size={32} color={colors.warning} />
              <Text style={styles.summaryValue}>{formatCurrency(stats.pendingAmount)}</Text>
              <Text style={styles.summaryLabel}>Pending Amount</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="alert-circle" size={32} color={colors.error} />
              <Text style={styles.summaryValue}>{formatCurrency(stats.overdueAmount)}</Text>
              <Text style={styles.summaryLabel}>Overdue Amount</Text>
            </View>
          </View>
        </View>

        {/* Student Count Summary */}
        <View style={styles.countContainer}>
          <View style={styles.countCard}>
            <Text style={styles.countValue}>{stats.totalStudents}</Text>
            <Text style={styles.countLabel}>Total Students</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={[styles.countValue, { color: colors.success }]}>{stats.paidStudents}</Text>
            <Text style={styles.countLabel}>Paid</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={[styles.countValue, { color: colors.warning }]}>{stats.pendingStudents}</Text>
            <Text style={styles.countLabel}>Pending</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={[styles.countValue, { color: colors.error }]}>{stats.overdueStudents}</Text>
            <Text style={styles.countLabel}>Overdue</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray400} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray400}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.gray400} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('all')}
            >
              <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
                All ({students.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'paid' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('paid')}
            >
              <Text style={[styles.filterText, filterStatus === 'paid' && styles.filterTextActive]}>
                Paid ({stats.paidStudents})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
                Pending ({stats.pendingStudents})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'overdue' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('overdue')}
            >
              <Text style={[styles.filterText, filterStatus === 'overdue' && styles.filterTextActive]}>
                Overdue ({stats.overdueStudents})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Students List */}
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <CustomCard key={student._id} style={styles.studentCard}>
                  <TouchableOpacity
                    onPress={() => toast.info(`Viewing ${student.name}'s payment history`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.studentRow}>
                      {/* Avatar */}
                      <View style={[styles.avatar, { 
                        backgroundColor: getFeeStatusColor(student.feeStatus) 
                      }]}>
                        <Text style={styles.avatarText}>
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </Text>
                      </View>

                      {/* Info */}
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentDetail}>
                          <Ionicons name="card-outline" size={12} color={colors.gray500} />{' '}
                          ID: {student.studentId || 'N/A'}
                        </Text>
                        <Text style={styles.studentDetail}>
                          <Ionicons name="book-outline" size={12} color={colors.gray500} />{' '}
                          {typeof student.class === 'object' ? student.class?.className : student.class}
                        </Text>
                      </View>

                      {/* Amount Info */}
                      <View style={styles.amountContainer}>
                        <Text style={styles.totalAmount}>{formatCurrency(student.totalAmount)}</Text>
                        <Text style={[styles.paidAmount, { color: colors.success }]}>
                          Paid: {formatCurrency(student.paidAmount)}
                        </Text>
                        <Text style={[styles.pendingAmount, { 
                          color: getFeeStatusColor(student.feeStatus) 
                        }]}>
                          Due: {formatCurrency(student.pendingAmount)}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusRow}>
                      <View style={[styles.statusBadge, { 
                        backgroundColor: getFeeStatusColor(student.feeStatus) 
                      }]}>
                        <Ionicons 
                          name={student.feeStatus === 'paid' ? 'checkmark-circle' : 
                                student.feeStatus === 'overdue' ? 'alert-circle' : 'time'} 
                          size={14} 
                          color={colors.white} 
                        />
                        <Text style={styles.statusText}>
                          {student.feeStatus.toUpperCase()}
                        </Text>
                      </View>
                      
                      {student.fees && student.fees.length > 0 && (
                        <Text style={styles.feesCount}>
                          {student.fees.length} {student.fees.length === 1 ? 'Fee' : 'Fees'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </CustomCard>
              ))
            ) : (
              <EmptyState
                icon="cash-outline"
                title="No Students Found"
                message={
                  searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No student financial records available'
                }
              />
            )}
          </Animated.View>
        </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs / 2,
    gap: spacing.xs / 2,
  },
  updateText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
    gap: spacing.xs / 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: fontSize.xs - 1,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  countContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  countCard: {
    flex: 1,
    alignItems: 'center',
  },
  countValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  countLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  content: {
    padding: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  filterText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  studentCard: {
    marginBottom: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  studentDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  paidAmount: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs / 4,
  },
  pendingAmount: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs / 2,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  feesCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default FinanceScreen;

