import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomCard from '../../components/CustomCard';
import CurvedHeader from '../../components/CurvedHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../utils/designSystem';

const TeacherProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { colors, isDarkMode } = useDesignSystem();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const InfoRow = ({ icon, label, value, isLast }) => (
    <View style={[styles.infoRow, !isLast && { borderBottomColor: colors.gray100, borderBottomWidth: 1 }]}>
      <View style={styles.infoLabelGroup}>
        <Ionicons name={icon} size={18} color={colors.primary} style={styles.rowIcon} />
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <CurvedHeader
          title="Faculty Profile"
          subtitle="Manage your professional account"
          showProfile={false}
        />

        <View style={styles.overlapContent}>
          {/* Profile Card Overlay */}
          <View style={styles.profileHeaderOverlay}>
            <View style={[styles.avatarWrapper, { borderColor: colors.cardBackground, ...shadows.medium }]}>
              <Image
                source={{ uri: user?.photo || 'https://ui-avatars.com/api/?name=' + (user?.name || 'Teacher') + '&background=6366f1&color=fff&size=128' }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.headerInfoText}>
              <Text style={[styles.headerName, { color: colors.textPrimary }]}>{user?.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>OFFICIAL FACULTY</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Professional Details</Text>
            <CustomCard style={{ padding: 4, marginBottom: 24 }}>
              <InfoRow icon="person-outline" label="Full Name" value={user?.name} />
              <InfoRow icon="mail-outline" label="Official Email" value={user?.email} />
              <InfoRow icon="school-outline" label="Department" value={user?.department || 'Academic Affairs'} />
              <InfoRow icon="briefcase-outline" label="Designation" value="Senior Faculty" isLast />
            </CustomCard>

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            <View style={styles.actionsList}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Attendance')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Mark Student Attendance</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.cardBackground, ...shadows.small }]}
                onPress={() => navigation.navigate('Grades')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="school-outline" size={22} color={colors.success} />
                </View>
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Manage Class Grades</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: isDarkMode ? colors.error + '20' : colors.error + '10' }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.logoutBtnText, { color: colors.error }]}>Sign Out Faculty Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  overlapContent: { marginTop: -45, zIndex: 10 },
  profileHeaderOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 5,
    marginBottom: 20,
    zIndex: 10,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  avatarImage: { width: '100%', height: '100%' },
  headerInfoText: { marginLeft: 16, marginTop: 40, flex: 1 },
  headerName: { fontSize: 22, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  headerStatus: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  infoLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 12 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  actionsList: { marginBottom: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionBtnText: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 12 },
  logoutBtnText: { fontSize: 16, fontWeight: 'bold' },
});

export default TeacherProfileScreen;
