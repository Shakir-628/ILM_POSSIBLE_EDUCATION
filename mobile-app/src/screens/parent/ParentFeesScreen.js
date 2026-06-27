import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';
import { parentService } from '../../services/parentService';
import { feeService } from '../../services/feeService';
import { useToast } from '../../context/ToastContext';

const ParentFeesScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [childrenFees, setChildrenFees] = useState({});
  
  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

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
    setSelectedChild(child);
    setPaymentModalVisible(true);
  };

  const processPayment = async () => {
    if (cardNumber.length < 16 || expiry.length < 4 || cvv.length < 3) {
      Alert.alert('Error', 'Please enter valid card details');
      return;
    }

    try {
      setProcessing(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call feeService.payFee(...)
      // Since this is a simulation, we'll just show success
      
      toast.success(`Payment of PKR ${childrenFees[selectedChild._id]?.pending.toLocaleString()} successful!`);
      setPaymentModalVisible(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
      fetchFeesData(); // Refresh data
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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
                        {child.firstName?.charAt(0)?.toUpperCase() || child.name?.charAt(0)?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
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
          </>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Secure Checkout</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentSummary}>
              <Text style={styles.paymentLabel}>Paying for:</Text>
              <Text style={styles.paymentValue}>{selectedChild?.firstName} {selectedChild?.lastName}</Text>
              <Text style={styles.paymentAmount}>
                PKR {selectedChild && childrenFees[selectedChild._id]?.pending.toLocaleString()}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12/25"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={setExpiry}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>

            <CustomButton
              title={processing ? "Processing..." : "Complete Payment"}
              onPress={processPayment}
              loading={processing}
              style={styles.payFinalButton}
              icon="lock-closed"
            />
            
            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.secureText}>SSL Encrypted Secure Payment</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 16 },
  summaryCard: { marginBottom: 20, backgroundColor: '#EEF2FF' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  summaryValue: { fontSize: 20, fontWeight: 'bold' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#cbd5e1' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  childCard: { marginBottom: 16 },
  childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  childAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  childInfo: { flex: 1 },
  childName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  childDetails: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  feesDetails: { marginBottom: 12 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 4, paddingTop: 12 },
  feeLabel: { fontSize: 14, color: '#6b7280' },
  feeLabelBold: { fontSize: 15, color: '#1f2937', fontWeight: '700' },
  feeValue: { fontSize: 14, fontWeight: '600' },
  feeValueBold: { fontSize: 16, color: '#1f2937', fontWeight: '700' },
  payButton: { marginTop: 8 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  paymentSummary: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
  paymentLabel: { fontSize: 14, color: '#6b7280' },
  paymentValue: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginVertical: 4 },
  paymentAmount: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5' },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 16 },
  payFinalButton: { marginTop: 8 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  secureText: { fontSize: 12, color: '#6b7280', marginLeft: 6 },
});

export default ParentFeesScreen;
