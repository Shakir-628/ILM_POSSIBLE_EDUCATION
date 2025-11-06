import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const ParentFeesScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [childrenFees, setChildrenFees] = useState({});

  useEffect(() => {
    fetchFeesData();
  }, []);

  const fetchFeesData = async () => {
    try {
      const childrenData = await parentService.getMyChildren();
      const childrenList = Array.isArray(childrenData) ? childrenData : childrenData.data || childrenData.children || [];
      
      setChildren(childrenList);

      // Fetch fees for each child
      const feesData = {};
      for (const child of childrenList) {
        try {
          const fees = await parentService.getChildFees(child._id || child.studentId);
          feesData[child._id || child.studentId] = fees;
        } catch (err) {
          console.error('Error fetching fees for child:', err);
          feesData[child._id || child.studentId] = { pending: 0, paid: 0, total: 0 };
        }
      }

      setChildrenFees(feesData);
    } catch (error) {
      console.error('Error fetching fees data:', error);
      toast.error('Failed to load fees data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeesData();
  };

  const handlePayFees = (child) => {
    toast.info('Payment gateway integration coming soon');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return <Loading message="Loading fees..." />;
  }

  const totalPending = Object.values(childrenFees).reduce((sum, fees) => sum + (fees.pending || 0), 0);
  const totalPaid = Object.values(childrenFees).reduce((sum, fees) => sum + (fees.paid || 0), 0);

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Fees Management"
        subtitle={`${children.length} child${children.length !== 1 ? 'ren' : ''}`}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <CustomCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Fee Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Pending</Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                PKR {totalPending.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                PKR {totalPaid.toLocaleString()}
              </Text>
            </View>
          </View>
        </CustomCard>

        {/* Children Fees */}
        {children.length === 0 ? (
          <EmptyState
            icon="cash-outline"
            title="No Fee Records"
            message="No children linked to your account"
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Fees by Child</Text>
            {children.map((child) => {
              const childId = child._id || child.studentId;
              const fees = childrenFees[childId] || { pending: 0, paid: 0, total: 0 };
              
              return (
                <CustomCard key={childId} style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <View style={styles.childAvatar}>
                      <Text style={styles.avatarText}>
                        {child.name?.charAt(0)?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childDetails}>
                        {child.studentId} • {typeof child.class === 'object' ? child.class?.className : child.class}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.feesDetails}>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Pending</Text>
                      <Text style={[styles.feeValue, { color: '#EF4444' }]}>
                        PKR {(fees.pending || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Paid</Text>
                      <Text style={[styles.feeValue, { color: '#10B981' }]}>
                        PKR {(fees.paid || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.feeRow, styles.totalRow]}>
                      <Text style={styles.feeLabelBold}>Total</Text>
                      <Text style={styles.feeValueBold}>
                        PKR {(fees.total || 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {fees.pending > 0 && (
                    <CustomButton
                      title="Pay Now"
                      onPress={() => handlePayFees(child)}
                      icon="card-outline"
                      size="small"
                      style={styles.payButton}
                    />
                  )}
                </CustomCard>
              );
            })}

            {/* Info Card */}
            <CustomCard style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#4F46E5" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Payment Methods</Text>
                <Text style={styles.infoText}>
                  Online payment gateway integration is coming soon. Currently, please pay fees at the school office.
                </Text>
              </View>
            </CustomCard>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 20,
    backgroundColor: '#EEF2FF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#cbd5e1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  childCard: {
    marginBottom: 16,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  childDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  feesDetails: {
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
    paddingTop: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  feeLabelBold: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '700',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  feeValueBold: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
  },
  payButton: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    marginTop: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default ParentFeesScreen;

