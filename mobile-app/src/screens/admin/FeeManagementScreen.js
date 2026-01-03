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
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format } from 'date-fns';

const FeeManagementScreen = ({ navigation }) => {
  const toast = useToast();
  const { isConnected, on, off } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('payments'); // payments, statistics
  const [feePayments, setFeePayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchFeePayments();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchFeePayments();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab]);

  const setupSocketListeners = () => {
    if (!isConnected) return;

    on('fee:created', handleFeeUpdate);
    on('fee:updated', handleFeeUpdate);
    on('fee:deleted', handleFeeUpdate);
    on('payment:received', handlePaymentReceived);
  };

  const cleanupSocketListeners = () => {
    off('fee:created', handleFeeUpdate);
    off('fee:updated', handleFeeUpdate);
    off('fee:deleted', handleFeeUpdate);
    off('payment:received', handlePaymentReceived);
  };

  const handleFeeUpdate = (data) => {
    toast.info('Fee records updated');
    if (activeTab === 'payments') fetchFeePayments();
    if (activeTab === 'statistics') fetchStatistics();
  };

  const handlePaymentReceived = (data) => {
    toast.success(`Payment received: PKR ${data.amount?.toLocaleString()}`);
    fetchFeePayments();
    fetchStatistics();
  };


  const fetchFeePayments = async () => {
    try {
      const payments = await feeService.getFeePayments();
      setFeePayments(Array.isArray(payments) ? payments : []);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching fee payments:', error);
      toast.error('Failed to load fee payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await feeService.getFeeStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'payments') fetchFeePayments();
    else if (activeTab === 'statistics') fetchStatistics();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return colors.success;
      case 'partial': return colors.info;
      case 'pending': return colors.warning;
      case 'overdue': return colors.error;
      case 'active': return colors.success;
      case 'inactive': return colors.gray500;
      default: return colors.gray500;
    }
  };


  if (loading) {
    return <Loading message="Loading fee management..." />;
  }

  const filteredPayments = feePayments.filter(payment => {
    const matchesSearch = payment.student?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fee Management</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
            onPress={() => setActiveTab('payments')}
          >
            <Ionicons
              name="card"
              size={20}
              color={activeTab === 'payments' ? colors.white : 'rgba(255,255,255,0.7)'}
            />
            <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
              Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'statistics' && styles.activeTab]}
            onPress={() => setActiveTab('statistics')}
          >
            <Ionicons
              name="stats-chart"
              size={20}
              color={activeTab === 'statistics' ? colors.white : 'rgba(255,255,255,0.7)'}
            />
            <Text style={[styles.tabText, activeTab === 'statistics' && styles.activeTabText]}>
              Statistics
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Search Bar */}
        {activeTab === 'payments' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab}...`}
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
        )}

        {/* Fee Payments Tab */}
        {activeTab === 'payments' && (
          <>
            <View style={styles.filterContainer}>
              {['all', 'pending', 'partial', 'paid', 'overdue'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <CustomCard key={payment._id} style={styles.card}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.invoiceNumber}>#{payment.invoiceNumber}</Text>
                    <View style={[
                      styles.paymentStatusBadge,
                      { backgroundColor: getStatusColor(payment.paymentStatus) }
                    ]}>
                      <Text style={styles.statusText}>{payment.paymentStatus.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentBody}>
                    <View style={styles.studentInfo}>
                      <Ionicons name="person" size={16} color={colors.gray500} />
                      <Text style={styles.studentName}>
                        {payment.student?.firstName} {payment.student?.lastName}
                      </Text>
                    </View>

                    <View style={styles.feeInfo}>
                      <Text style={styles.feeName}>{payment.feeStructure?.feeName}</Text>
                      <Text style={styles.feeType}>({payment.feeStructure?.feeType})</Text>
                    </View>

                    <View style={styles.amountDetails}>
                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Amount:</Text>
                        <Text style={styles.amountValue}>PKR {payment.amount?.toLocaleString()}</Text>
                      </View>
                      {payment.lateFee > 0 && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Late Fee:</Text>
                          <Text style={[styles.amountValue, { color: colors.error }]}>
                            +PKR {payment.lateFee?.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {payment.discount > 0 && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Discount:</Text>
                          <Text style={[styles.amountValue, { color: colors.success }]}>
                            -PKR {payment.discount?.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.amountRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>PKR {payment.totalAmount?.toLocaleString()}</Text>
                      </View>
                      {payment.amountPaid > 0 && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Paid:</Text>
                          <Text style={[styles.amountValue, { color: colors.success }]}>
                            PKR {payment.amountPaid?.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {payment.balance > 0 && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Balance:</Text>
                          <Text style={[styles.amountValue, { color: colors.error }]}>
                            PKR {payment.balance?.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.gray500} />
                      <Text style={styles.dateText}>
                        Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                      </Text>
                    </View>
                  </View>
                </CustomCard>
              ))
            ) : (
              <EmptyState
                icon="card-outline"
                title="No Payments"
                message="No fee payments found"
              />
            )}
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && statistics && (
          <View>
            <CustomCard style={styles.statsCard}>
              <Text style={styles.statsTitle}>Financial Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="cash" size={32} color={colors.success} />
                  <Text style={styles.statValue}>PKR {statistics.totalInvoiced?.toLocaleString() || '0'}</Text>
                  <Text style={styles.statLabel}>Total Invoiced</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.info} />
                  <Text style={styles.statValue}>PKR {statistics.totalCollected?.toLocaleString() || '0'}</Text>
                  <Text style={styles.statLabel}>Total Collected</Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={32} color={colors.warning} />
                  <Text style={styles.statValue}>PKR {statistics.totalPending?.toLocaleString() || '0'}</Text>
                  <Text style={styles.statLabel}>Total Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="alert-circle" size={32} color={colors.error} />
                  <Text style={styles.statValue}>{statistics.overdueCount || 0}</Text>
                  <Text style={styles.statLabel}>Overdue Payments</Text>
                </View>
              </View>
            </CustomCard>

            <CustomCard style={styles.statsCard}>
              <Text style={styles.statsTitle}>Payment Breakdown</Text>
              {(() => {
                const getCount = (status) => statistics.paymentsByStatus?.find(p => p._id === status)?.count || 0;
                const paidCount = getCount('paid');
                const pendingCount = getCount('pending');
                const partialCount = getCount('partial');
                const totalCount = (statistics.paymentsByStatus || []).reduce((acc, curr) => acc + curr.count, 0);

                return (
                  <>
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Total Transactions:</Text>
                      <Text style={styles.statRowValue}>{totalCount}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Paid:</Text>
                      <Text style={[styles.statRowValue, { color: colors.success }]}>
                        {paidCount}
                      </Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Pending:</Text>
                      <Text style={[styles.statRowValue, { color: colors.warning }]}>
                        {pendingCount}
                      </Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Partial:</Text>
                      <Text style={[styles.statRowValue, { color: colors.info }]}>
                        {partialCount}
                      </Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Overdue:</Text>
                      <Text style={[styles.statRowValue, { color: colors.error }]}>
                        {statistics.overdueCount || 0}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </CustomCard>
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs / 2,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: fontWeight.medium,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
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
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
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
  card: {
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  invoiceNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  paymentStatusBadge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  paymentBody: {
    gap: spacing.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  studentName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  feeName: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  feeType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amountDetails: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  amountLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amountValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  totalValue: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  statRowLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  statRowValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});

export default FeeManagementScreen;

