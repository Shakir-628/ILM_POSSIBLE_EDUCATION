import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import { format } from 'date-fns';
import { colors, spacing, fontSize, fontWeight, borderRadius, getPriorityColor } from '../../utils/designSystem';

const AnnouncementDetailScreen = ({ route, navigation }) => {
  const { announcement } = route.params;

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'alert-circle';
      case 'high':
        return 'arrow-up-circle';
      case 'medium':
        return 'information-circle';
      case 'low':
        return 'arrow-down-circle';
      default:
        return 'information-circle';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'checkmark-circle';
      case 'draft':
        return 'create';
      case 'archived':
        return 'archive';
      default:
        return 'document';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return colors.success;
      case 'draft':
        return colors.warning;
      case 'archived':
        return colors.gray500;
      default:
        return colors.gray400;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[getPriorityColor(announcement.priority), getPriorityColor(announcement.priority) + 'CC']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {announcement.pinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={16} color={colors.white} />
              </View>
            )}
          </View>
        </View>

        <Text style={styles.headerTitle}>{announcement.title}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Ionicons 
              name={getPriorityIcon(announcement.priority)} 
              size={14} 
              color={colors.white} 
            />
            <Text style={styles.metaBadgeText}>
              {announcement.priority?.toUpperCase() || 'NORMAL'}
            </Text>
          </View>
          
          <View style={[styles.metaBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons 
              name={getStatusIcon(announcement.status)} 
              size={14} 
              color={colors.white} 
            />
            <Text style={styles.metaBadgeText}>
              {announcement.status?.toUpperCase() || 'ACTIVE'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Main Content */}
        <CustomCard style={styles.contentCard}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Message</Text>
            </View>
            <Text style={styles.contentText}>{announcement.content}</Text>
          </View>
        </CustomCard>

        {/* Author Info */}
        {announcement.createdBy && (
          <CustomCard style={styles.authorCard}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-circle" size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Posted By</Text>
              </View>
              
              <View style={styles.authorInfo}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.avatarText}>
                    {announcement.createdBy.name?.charAt(0)?.toUpperCase() || 'A'}
                  </Text>
                </View>
                <View style={styles.authorDetails}>
                  <Text style={styles.authorName}>{announcement.createdBy.name}</Text>
                  <Text style={styles.authorEmail}>{announcement.createdBy.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {announcement.createdBy.role?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </CustomCard>
        )}

        {/* Audience Info */}
        {announcement.audience && (
          <CustomCard style={styles.audienceCard}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people" size={20} color={colors.info} />
                <Text style={styles.sectionTitle}>Audience</Text>
              </View>
              
              <View style={styles.audienceInfo}>
                <View style={styles.audienceRow}>
                  <Text style={styles.audienceLabel}>Type:</Text>
                  <View style={[styles.audienceTypeBadge, { 
                    backgroundColor: announcement.audience.type === 'all' ? colors.success + '20' : colors.info + '20'
                  }]}>
                    <Text style={[styles.audienceTypeText, {
                      color: announcement.audience.type === 'all' ? colors.success : colors.info
                    }]}>
                      {announcement.audience.type === 'all' ? '📢 Everyone' : '🎯 Specific'}
                    </Text>
                  </View>
                </View>

                {announcement.audience.roles && announcement.audience.roles.length > 0 && (
                  <View style={styles.audienceRow}>
                    <Text style={styles.audienceLabel}>Roles:</Text>
                    <View style={styles.tagsContainer}>
                      {announcement.audience.roles.map((role, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{role}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {announcement.audience.classes && announcement.audience.classes.length > 0 && (
                  <View style={styles.audienceRow}>
                    <Text style={styles.audienceLabel}>Classes:</Text>
                    <View style={styles.tagsContainer}>
                      {announcement.audience.classes.map((cls, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
                          <Text style={[styles.tagText, { color: colors.warning }]}>
                            {typeof cls === 'object' ? cls.className : cls}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </CustomCard>
        )}

        {/* Dates Info */}
        <CustomCard style={styles.datesCard}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Timeline</Text>
            </View>
            
            <View style={styles.datesList}>
              <View style={styles.dateRow}>
                <Ionicons name="add-circle-outline" size={18} color={colors.textSecondary} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Created</Text>
                  <Text style={styles.dateValue}>
                    {announcement.createdAt 
                      ? format(new Date(announcement.createdAt), 'MMM dd, yyyy • hh:mm a')
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                <View style={styles.dateRow}>
                  <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Last Updated</Text>
                    <Text style={styles.dateValue}>
                      {format(new Date(announcement.updatedAt), 'MMM dd, yyyy • hh:mm a')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </CustomCard>

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <CustomCard style={styles.attachmentsCard}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="attach" size={20} color={colors.error} />
                <Text style={styles.sectionTitle}>Attachments ({announcement.attachments.length})</Text>
              </View>
              
              {announcement.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Ionicons name="document" size={24} color={colors.primary} />
                  <Text style={styles.attachmentName}>{attachment.name || `Attachment ${index + 1}`}</Text>
                </View>
              ))}
            </View>
          </CustomCard>
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pinnedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    gap: spacing.xs,
  },
  metaBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  contentCard: {
    marginBottom: spacing.md,
  },
  authorCard: {
    marginBottom: spacing.md,
  },
  audienceCard: {
    marginBottom: spacing.md,
  },
  datesCard: {
    marginBottom: spacing.md,
  },
  attachmentsCard: {
    marginBottom: spacing.md,
  },
  section: {
    // padding already in CustomCard
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  contentText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  authorEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.success + '20',
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
  audienceInfo: {
    gap: spacing.md,
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  audienceLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    width: 80,
  },
  audienceTypeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  audienceTypeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '20',
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  datesList: {
    gap: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  dateValue: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  attachmentName: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
});

export default AnnouncementDetailScreen;

