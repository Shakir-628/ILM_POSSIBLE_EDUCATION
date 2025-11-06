import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomCard from './CustomCard';
import { colors, spacing, fontSize, fontWeight, borderRadius, getStatusColor } from '../utils/designSystem';

/**
 * Reusable Student Card Component
 * @param {object} student - Student data
 * @param {function} onPress - Optional press handler
 * @param {boolean} showEmail - Show email (default: false)
 * @param {object} style - Additional styles
 */
const StudentCard = ({ student, onPress, showEmail = false, style }) => {
  const cardContent = (
    <View style={styles.studentRow}>
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>
          {student.name?.charAt(0)?.toUpperCase() || 'S'}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentDetails}>
          {student.studentId} • {typeof student.class === 'object' ? student.class?.className : student.class} {student.section}
        </Text>
        {showEmail && student.email && (
          <Text style={styles.studentEmail}>{student.email}</Text>
        )}
      </View>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusColor(student.status)
                  }]}>
                    <Text style={styles.statusText}>
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(student)}>
        <CustomCard style={[styles.card, style]}>
          {cardContent}
        </CustomCard>
      </TouchableOpacity>
    );
  }

  return (
    <CustomCard style={[styles.card, style]}>
      {cardContent}
    </CustomCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  studentDetails: {
    fontSize: fontSize.sm + 1,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  studentEmail: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs / 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

export default StudentCard;

