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
import { eventService } from '../../services/eventService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

const EventsScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents();
      setEvents(Array.isArray(data) ? data : data.data || []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'holiday': return 'calendar';
      case 'exam': return 'document-text';
      case 'meeting': return 'people';
      case 'sports': return 'basketball';
      case 'cultural': return 'musical-notes';
      case 'academic': return 'school';
      default: return 'calendar-outline';
    }
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'holiday': return colors.success;
      case 'exam': return colors.error;
      case 'meeting': return colors.info;
      case 'sports': return '#F97316';
      case 'cultural': return '#A855F7';
      case 'academic': return colors.primary;
      default: return colors.gray500;
    }
  };

  const getDateLabel = (date) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    if (isPast(eventDate)) return 'Past';
    return format(eventDate, 'MMM dd, yyyy');
  };

  const getDateBadgeColor = (date) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return colors.error;
    if (isTomorrow(eventDate)) return colors.warning;
    if (isPast(eventDate)) return colors.gray400;
    return colors.primary;
  };

  if (loading) {
    return <Loading message="Loading events..." />;
  }

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter(e => e.eventType === filterType);

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <Ionicons name="calendar" size={40} color={colors.white} />
        <Text style={styles.headerTitle}>Events & Calendar</Text>
        <Text style={styles.headerSubtitle}>School calendar and upcoming events</Text>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Type Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'holiday', 'exam', 'meeting', 'sports', 'cultural', 'academic'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  filterType === type && styles.filterChipActive,
                  filterType === type && type !== 'all' && { 
                    backgroundColor: getEventColor(type)
                  }
                ]}
                onPress={() => setFilterType(type)}
              >
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

        {/* Events List */}
        {sortedEvents.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {sortedEvents.map((event) => (
              <CustomCard key={event._id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={[
                    styles.eventIcon,
                    { backgroundColor: getEventColor(event.eventType) + '20' }
                  ]}>
                    <Ionicons
                      name={getEventIcon(event.eventType)}
                      size={28}
                      color={getEventColor(event.eventType)}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={styles.eventMeta}>
                      <Ionicons name="time-outline" size={14} color={colors.gray500} />
                      <Text style={styles.eventMetaText}>
                        {format(new Date(event.startDate), 'MMM dd, yyyy')}
                        {event.endDate && 
                          ` - ${format(new Date(event.endDate), 'MMM dd, yyyy')}`
                        }
                      </Text>
                    </View>
                    {event.location && (
                      <View style={styles.eventMeta}>
                        <Ionicons name="location-outline" size={14} color={colors.gray500} />
                        <Text style={styles.eventMetaText}>{event.location}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.dateBadge,
                    { backgroundColor: getDateBadgeColor(event.startDate) }
                  ]}>
                    <Text style={styles.dateBadgeText}>
                      {getDateLabel(event.startDate)}
                    </Text>
                  </View>
                </View>

                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}

                <View style={styles.eventFooter}>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: getEventColor(event.eventType) }
                  ]}>
                    <Text style={styles.typeBadgeText}>
                      {event.eventType.toUpperCase()}
                    </Text>
                  </View>
                  {event.allDay ? (
                    <View style={styles.allDayBadge}>
                      <Ionicons name="infinite" size={14} color={colors.primary} />
                      <Text style={styles.allDayText}>All Day</Text>
                    </View>
                  ) : event.startTime && (
                    <View style={styles.timeBadge}>
                      <Ionicons name="time" size={14} color={colors.gray500} />
                      <Text style={styles.timeText}>{event.startTime}</Text>
                    </View>
                  )}
                </View>
              </CustomCard>
            ))}
          </Animated.View>
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Events"
            message={filterType === 'all'
              ? "No events scheduled at the moment"
              : `No ${filterType} events available`
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
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
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
  eventCard: {
    marginBottom: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  eventIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs / 2,
  },
  eventMetaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dateBadge: {
    height: 56,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  dateBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  eventDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  typeBadge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  allDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  allDayText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  timeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});

export default EventsScreen;

