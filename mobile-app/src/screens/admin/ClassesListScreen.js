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
import { classService } from '../../services/classService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';

const ClassesListScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(Array.isArray(data) ? data : []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    if (searchQuery) {
      filtered = filtered.filter(
        (cls) =>
          cls.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.grade?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.section?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  if (loading) {
    return <Loading message="Loading classes..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Classes</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{classes.length}</Text>
            <Text style={styles.statLabel}>Total Classes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {classes.filter((c) => c.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
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
            placeholder="Search by class name, grade, or section..."
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

        {/* Classes Grid */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredClasses.length > 0 ? (
            <View style={styles.classesGrid}>
              {filteredClasses.map((classItem) => (
                <CustomCard key={classItem._id} style={styles.classCard}>
                  <TouchableOpacity
                    onPress={() => toast.info(`Viewing ${classItem.className} details`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.classContent}>
                      {/* Icon */}
                      <View style={styles.classIconContainer}>
                        <Ionicons name="book" size={32} color={colors.warning} />
                      </View>

                      {/* Class Name */}
                      <Text style={styles.className}>{classItem.className}</Text>
                      
                      {/* Grade & Section */}
                      <View style={styles.infoRow}>
                        <View style={styles.infoBadge}>
                          <Text style={styles.infoBadgeText}>Grade {classItem.grade}</Text>
                        </View>
                        {classItem.section && (
                          <View style={[styles.infoBadge, { backgroundColor: colors.info + '20' }]}>
                            <Text style={[styles.infoBadgeText, { color: colors.info }]}>
                              Section {classItem.section}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Stats */}
                      <View style={styles.classStats}>
                        <View style={styles.statChip}>
                          <Ionicons name="people-outline" size={16} color={colors.primary} />
                          <Text style={styles.statChipText}>
                            {classItem.students?.length || 0} Students
                          </Text>
                        </View>
                      </View>

                      {/* Status */}
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              classItem.status === 'active' ? colors.success : colors.gray300,
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {classItem.status === 'active' ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </CustomCard>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="book-outline"
              title="No Classes Found"
              message={
                searchQuery
                  ? 'Try adjusting your search'
                  : 'No classes available at the moment'
              }
            />
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
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classCard: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  classContent: {
    alignItems: 'center',
  },
  classIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  className: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  infoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.warning + '20',
  },
  infoBadgeText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    fontWeight: fontWeight.semibold,
  },
  classStats: {
    marginBottom: spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

export default ClassesListScreen;

