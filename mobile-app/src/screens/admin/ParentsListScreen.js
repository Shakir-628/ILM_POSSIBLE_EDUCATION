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
import { parentService } from '../../services/parentService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';

const ParentsListScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    filterParents();
  }, [searchQuery, parents]);

  const fetchParents = async () => {
    try {
      const data = await parentService.getAllParents();
      console.log('Parents data received:', data);
      
      // Handle different response formats
      const parentsArray = Array.isArray(data) ? data : (data?.parents || data?.data || []);
      setParents(parentsArray);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      if (parentsArray.length === 0) {
        toast.info('No parents found in the system');
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load parents';
      toast.error(errorMessage);
      setParents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterParents = () => {
    let filtered = parents;

    if (searchQuery) {
      filtered = filtered.filter(
        (parent) =>
          parent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.phone?.includes(searchQuery)
      );
    }

    setFilteredParents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchParents();
  };

  if (loading) {
    return <Loading message="Loading parents..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parents</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{parents.length}</Text>
            <Text style={styles.statLabel}>Total Parents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {parents.reduce((acc, p) => acc + (p.children?.length || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Children</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
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

        {/* Parents List */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredParents.length > 0 ? (
            filteredParents.map((parent) => (
              <CustomCard key={parent._id} style={styles.parentCard}>
                <TouchableOpacity
                  onPress={() => toast.info(`Viewing ${parent.name}'s details`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.parentRow}>
                    {/* Avatar */}
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={28} color={colors.white} />
                    </View>

                    {/* Info */}
                    <View style={styles.parentInfo}>
                      <Text style={styles.parentName}>{parent.name}</Text>
                      
                      <View style={styles.contactRow}>
                        <Ionicons name="mail-outline" size={14} color={colors.gray500} />
                        <Text style={styles.contactText}>{parent.email}</Text>
                      </View>
                      
                      {parent.phone && (
                        <View style={styles.contactRow}>
                          <Ionicons name="call-outline" size={14} color={colors.gray500} />
                          <Text style={styles.contactText}>{parent.phone}</Text>
                        </View>
                      )}

                      {/* Children */}
                      {parent.children && parent.children.length > 0 && (
                        <View style={styles.childrenContainer}>
                          <Ionicons name="people-outline" size={14} color={colors.primary} />
                          <Text style={styles.childrenText}>
                            {parent.children.length} {parent.children.length === 1 ? 'Child' : 'Children'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Arrow */}
                    <Ionicons name="chevron-forward" size={24} color={colors.gray300} />
                  </View>

                  {/* Children List */}
                  {parent.children && parent.children.length > 0 && (
                    <View style={styles.childrenList}>
                      {parent.children.slice(0, 3).map((child, index) => (
                        <View key={index} style={styles.childChip}>
                          <Text style={styles.childChipText}>
                            {typeof child === 'object' ? child.name : child}
                          </Text>
                        </View>
                      ))}
                      {parent.children.length > 3 && (
                        <View style={styles.childChip}>
                          <Text style={styles.childChipText}>
                            +{parent.children.length - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </CustomCard>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <EmptyState
                icon="people-outline"
                title="No Parents Found"
                message={
                  searchQuery
                    ? 'Try adjusting your search'
                    : 'No parent accounts exist in the system yet.\n\nParent accounts are created when students are enrolled and their guardians are registered.'
                }
              />
              {!searchQuery && (
                <View style={styles.infoCard}>
                  <Ionicons name="information-circle" size={24} color={colors.info} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>How to add parents?</Text>
                    <Text style={styles.infoText}>
                      Parents are automatically created when:
                      {'\n'}• Students are enrolled with guardian information
                      {'\n'}• Parent accounts are created through the admin panel
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </Animated.View>
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
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
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
  parentCard: {
    marginBottom: spacing.md,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  parentInfo: {
    flex: 1,
  },
  parentName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
    gap: spacing.xs,
  },
  contactText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  childrenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  childrenText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  childrenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    gap: spacing.sm,
  },
  childChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
  },
  childChipText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  emptyStateContainer: {
    paddingTop: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '15',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default ParentsListScreen;

