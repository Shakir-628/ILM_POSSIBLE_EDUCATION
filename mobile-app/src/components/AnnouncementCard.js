import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomCard from './CustomCard';
import { format } from 'date-fns';
import { colors, spacing, fontSize, fontWeight, borderRadius, getPriorityColor } from '../utils/designSystem';

/**
 * Reusable Announcement Card Component
 * @param {object} announcement - Announcement data
 * @param {function} onPress - Optional press handler
 * @param {boolean} compact - Show compact version (default: false)
 * @param {object} style - Additional styles
 */
const AnnouncementCard = ({ announcement, onPress, compact = false, style }) => {
  const cardContent = (
    <>
      <View style={styles.header}>
        <View style={[styles.priorityBadge, { 
          backgroundColor: getPriorityColor(announcement.priority) 
        }]}>
          <Text style={styles.priorityText}>
            {announcement.priority?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.date}>
          {announcement.createdAt ? format(new Date(announcement.createdAt), 'MMM dd, yyyy') : 'N/A'}
        </Text>
      </View>
      
      <Text style={styles.title}>{announcement.title}</Text>
      <Text 
        style={styles.content} 
        numberOfLines={compact ? 2 : undefined}
      >
        {announcement.content}
      </Text>
      
      {!compact && announcement.targetAudience && announcement.targetAudience.length > 0 && (
        <View style={styles.audienceContainer}>
          <Text style={styles.audienceLabel}>For: </Text>
          <Text style={styles.audienceText}>
            {announcement.targetAudience.join(', ')}
          </Text>
        </View>
      )}
      
      {!compact && announcement.author && (
        <Text style={styles.author}>
          By: {announcement.author.name || 'Admin'}
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(announcement)}>
        <CustomCard style={[styles.card, style]}>
          {cardContent}
        </CustomCard>
      </TouchableOpacity>
    );
  }

  return (
    <CustomCard style={[styles.card, compact && styles.cardCompact, style]}>
      {cardContent}
    </CustomCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  cardCompact: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  priorityText: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: fontSize.base,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  audienceContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  audienceLabel: {
    fontSize: fontSize.sm + 1,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  audienceText: {
    fontSize: fontSize.sm + 1,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  author: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});

export default AnnouncementCard;

