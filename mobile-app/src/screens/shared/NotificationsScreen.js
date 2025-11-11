import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format, formatDistanceToNow } from 'date-fns';

const NotificationsScreen = ({ navigation }) => {
  const toast = useToast();
  const { isConnected, on, off } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all'); // all, read, unread
  const [unreadCount, setUnreadCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    calculateUnreadCount();
  }, [notifications]);

  const setupSocketListeners = () => {
    if (!isConnected) return;

    on('notification:new', handleNewNotification);
    on('notification:updated', handleNotificationUpdate);
    console.log('✅ Socket listeners setup for Notifications');
  };

  const cleanupSocketListeners = () => {
    off('notification:new', handleNewNotification);
    off('notification:updated', handleNotificationUpdate);
    console.log('🧹 Socket listeners cleaned up for Notifications');
  };

  const handleNewNotification = (notification) => {
    console.log('🔔 New notification received:', notification);
    setNotifications(prev => [notification, ...prev]);
    toast.success('New notification received');
  };

  const handleNotificationUpdate = (updatedNotification) => {
    setNotifications(prev =>
      prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
    );
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(data) ? data : data.data || []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateUnreadCount = () => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              setNotifications(prev => prev.filter(n => n._id !== notificationId));
              toast.success('Notification deleted');
            } catch (error) {
              toast.error('Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'grade': return 'school';
      case 'announcement': return 'megaphone';
      case 'fee': return 'cash';
      case 'assignment': return 'document-text';
      case 'attendance': return 'calendar';
      case 'event': return 'calendar-outline';
      case 'message': return 'chatbubble';
      case 'exam': return 'pencil';
      case 'alert': return 'alert-circle';
      case 'reminder': return 'time';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'grade': return '#8B5CF6';
      case 'announcement': return '#F59E0B';
      case 'fee': return '#10B981';
      case 'assignment': return '#3B82F6';
      case 'attendance': return '#6366F1';
      case 'event': return '#EC4899';
      case 'message': return '#14B8A6';
      case 'exam': return '#EF4444';
      case 'alert': return '#DC2626';
      case 'reminder': return '#F97316';
      default: return colors.gray500;
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type?.toLowerCase()) {
      case 'grade':
        navigation.navigate('Grades');
        break;
      case 'announcement':
        navigation.navigate('Announcements');
        break;
      case 'fee':
        navigation.navigate('Fees');
        break;
      case 'assignment':
        navigation.navigate('Assignments');
        break;
      case 'attendance':
        navigation.navigate('Attendance');
        break;
      case 'event':
        // Navigate to Events screen if available
        toast.info('Opening event details...');
        break;
      default:
        toast.info(notification.title);
    }
  };

  if (loading) {
    return <Loading message="Loading notifications..." />;
  }

  // Apply filters
  let filteredNotifications = notifications;

  if (filterType !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.type === filterType);
  }

  if (filterRead === 'unread') {
    filteredNotifications = filteredNotifications.filter(n => !n.read);
  } else if (filterRead === 'read') {
    filteredNotifications = filteredNotifications.filter(n => n.read);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color={colors.white} />
              <Text style={styles.markAllText}>Mark All</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Read Status Filter */}
        <View style={styles.statusFilterContainer}>
          {['all', 'unread', 'read'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterChip,
                filterRead === status && styles.statusFilterChipActive
              ]}
              onPress={() => setFilterRead(status)}
            >
              <Text style={[
                styles.statusFilterText,
                filterRead === status && styles.statusFilterTextActive
              ]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Type Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'grade', 'announcement', 'fee', 'assignment', 'attendance', 'event', 'exam', 'reminder'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  filterType === type && styles.filterChipActive,
                  filterType === type && type !== 'all' && {
                    backgroundColor: getNotificationColor(type)
                  }
                ]}
                onPress={() => setFilterType(type)}
              >
                {type !== 'all' && filterType === type && (
                  <Ionicons
                    name={getNotificationIcon(type)}
                    size={14}
                    color={colors.white}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[
                  styles.filterChipText,
                  filterType === type && styles.filterChipTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <CustomCard style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}>
                  <View style={styles.cardContent}>
                    <View style={[
                      styles.notificationIcon,
                      { backgroundColor: getNotificationColor(notification.type) + '20' }
                    ]}>
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={24}
                        color={getNotificationColor(notification.type)}
                      />
                    </View>

                    <View style={styles.notificationInfo}>
                      <View style={styles.notificationHeader}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadText
                        ]} numberOfLines={2}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>

                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>

                      <View style={styles.notificationMeta}>
                        <View style={[
                          styles.typeBadge,
                          { backgroundColor: getNotificationColor(notification.type) }
                        ]}>
                          <Text style={styles.typeBadgeText}>
                            {notification.type.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.timeContainer}>
                          <Ionicons name="time-outline" size={12} color={colors.gray500} />
                          <Text style={styles.timeText}>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Text>
                        </View>
                      </View>

                      {/* Fee Due Date */}
                      {notification.type === 'fee' && notification.metadata?.dueDate && (
                        <View style={styles.dueDateContainer}>
                          <Ionicons name="calendar-outline" size={14} color={colors.error} />
                          <Text style={styles.dueDateText}>
                            Due: {format(new Date(notification.metadata.dueDate), 'MMM dd, yyyy')}
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNotification(notification._id)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.gray400} />
                    </TouchableOpacity>
                  </View>
                </CustomCard>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ) : (
          <EmptyState
            icon="notifications-outline"
            title={filterType === 'all' && filterRead === 'all' ? "No Notifications" : "No Results"}
            message={
              filterType === 'all' && filterRead === 'all'
                ? "You're all caught up! No notifications at the moment."
                : `No ${filterRead !== 'all' ? filterRead : ''} ${filterType !== 'all' ? filterType : ''} notifications found`
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
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs / 2,
  },
  markAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statusFilterChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  statusFilterChipActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  statusFilterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  statusFilterTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.error,
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
  notificationCard: {
    marginBottom: spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  unreadText: {
    fontWeight: fontWeight.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginTop: spacing.xs / 2,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingVertical: spacing.xs / 4,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.sm,
  },
  dueDateText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});

export default NotificationsScreen;

