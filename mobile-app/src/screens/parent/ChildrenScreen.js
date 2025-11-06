import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import StudentCard from '../../components/StudentCard';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';

const ChildrenScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const data = await parentService.getMyChildren();
      const childrenList = Array.isArray(data) ? data : data.data || data.children || [];
      setChildren(childrenList);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children data');
      // Set mock data for testing if API not ready
      setChildren([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildren();
  };

  const handleChildPress = (child) => {
    navigation.navigate('ChildDetails', { student: child });
  };

  if (loading) {
    return <Loading message="Loading children..." />;
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="My Children"
        subtitle={`${children.length} child${children.length !== 1 ? 'ren' : ''}`}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {children.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Children Found"
            message="No students are linked to your parent account yet. Contact the school administration."
          />
        ) : (
          <>
            {children.map((child) => (
              <StudentCard
                key={child._id || child.studentId}
                student={child}
                onPress={handleChildPress}
                showEmail={true}
              />
            ))}

            {/* Help Card */}
            <CustomCard style={styles.helpCard}>
              <Ionicons name="information-circle" size={24} color="#4F46E5" />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Need to add a child?</Text>
                <Text style={styles.helpText}>
                  Contact school administration to link your children to your parent account.
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
  helpCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
  },
  helpContent: {
    marginLeft: 12,
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default ChildrenScreen;

