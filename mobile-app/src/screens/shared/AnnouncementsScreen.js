import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format } from 'date-fns';

const AnnouncementsScreen = ({ navigation }) => {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [filterPriority, setFilterPriority] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementService.getAllAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : data.data || []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'normal': return colors.info;
      case 'low': return colors.success;
      default: return colors.gray500;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'alert-circle';
      case 'high': return 'warning';
      case 'normal': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'megaphone';
    }
  };

  const handleAnnouncementPress = (announcement) => {
    // Navigate to announcement detail if you have a detail screen
    // navigation.navigate('AnnouncementDetail', { announcement });
    toast.info('Announcement details');
  };

  if (loading) {
    return <Loading message="Loading announcements..." />;
  }

  const filteredAnnouncements = filterPriority === 'all'
    ? announcements
    : announcements.filter(a => a.priority === filterPriority);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.header}>
        <Ionicons name="megaphone" size={40} color={colors.white} />
        <Text style={styles.headerTitle}>Announcements</Text>
        <Text style={styles.headerSubtitle}>Stay updated with latest news</Text>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Priority Filter */}
        <View style={styles.filterContainer}>
          {['all', 'urgent', 'high', 'normal', 'low'].map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterChip,
                filterPriority === priority && styles.filterChipActive,
                filterPriority === priority && { 
                  backgroundColor: priority === 'all' ? colors.primary : getPriorityColor(priority)
                }
              ]}
              onPress={() => setFilterPriority(priority)}
            >
              <Text style={[
                styles.filterChipText,
                filterPriority === priority && styles.filterChipTextActive
              ]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements List */}
        {filteredAnnouncements.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredAnnouncements.map((announcement) => (
              <TouchableOpacity
                key={announcement._id}
                onPress={() => handleAnnouncementPress(announcement)}
                activeOpacity={0.7}
              >
                <CustomCard style={styles.announcementCard}>
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.priorityIcon,
                      { backgroundColor: getPriorityColor(announcement.priority) + '20' }
                    ]}>
                      <Ionicons
                        name={getPriorityIcon(announcement.priority)}
                        size={24}
                        color={getPriorityColor(announcement.priority)}
                      />
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.title} numberOfLines={2}>
                        {announcement.title}
                      </Text>
                      <View style={styles.metaInfo}>
                        <Ionicons name="person-outline" size={12} color={colors.gray500} />
                        <Text style={styles.metaText}>
                          {typeof announcement.createdBy === 'object' 
                            ? announcement.createdBy.name 
                            : announcement.createdBy}
                        </Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Ionicons name="time-outline" size={12} color={colors.gray500} />
                        <Text style={styles.metaText}>
                          {format(new Date(announcement.createdAt), 'MMM dd, yyyy')}
                        </Text>
                      </View>
                    </View>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(announcement.priority) }
                    ]}>
                      <Text style={styles.priorityText}>
                        {announcement.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.content} numberOfLines={3}>
                    {announcement.content}
                  </Text>

                  {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                    <View style={styles.targetRoles}>
                      <Ionicons name="people-outline" size={14} color={colors.gray500} />
                      <Text style={styles.targetText}>
                        For: {announcement.targetRoles.join(', ')}
                      </Text>
                    </View>
                  )}

                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <View style={styles.attachments}>
                      <Ionicons name="attach-outline" size={14} color={colors.primary} />
                      <Text style={styles.attachmentText}>
                        {announcement.attachments.length} attachment(s)
                      </Text>
                    </View>
                  )}
                </CustomCard>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ) : (
          <EmptyState
            icon="megaphone-outline"
            title="No Announcements"
            message={filterPriority === 'all'
              ? "No announcements available at the moment"
              : `No ${filterPriority} priority announcements`
            }
          />
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
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
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
    borderColor: 'transparent',
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
  announcementCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  priorityIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  priorityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  targetRoles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  targetText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  attachmentText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});

export default AnnouncementsScreen;

