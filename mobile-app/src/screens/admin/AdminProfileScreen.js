import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomCard from '../../components/CustomCard';
import CurvedHeader from '../../components/CurvedHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../utils/designSystem';

const AdminProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { colors, isDarkMode } = useDesignSystem();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      if (Platform.OS === 'web') {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      toast.error('Failed to logout');
      setLoggingOut(false);
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <View style={[styles.infoItem, { borderBottomColor: colors.gray100 }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <div style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || 'Not provided'}</Text>
      </div>
    </View>
  );

  const ActionCard = ({ icon, label, color, onPress }) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: colors.cardBackground, ...shadows.small }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionText, { color: colors.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
    </TouchableOpacity>
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
          title="My Profile"
          subtitle="Manage your account & settings"
          showProfile={false}
        />

        <View style={styles.overlapContent}>
          {/* Profile Card Overlay */}
          <View style={styles.profileHeaderOverlay}>
            <View style={[styles.avatarWrapper, { borderColor: colors.cardBackground, ...shadows.medium }]}>
              <Image
                source={{ uri: user?.photo || 'https://ui-avatars.com/api/?name=' + (user?.name || 'Admin') + '&background=6366f1&color=fff&size=128' }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.headerInfoText}>
              <Text style={[styles.headerName, { color: colors.textPrimary }]}>{user?.name || 'Admin User'}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>ADMINISTRATOR</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account Settings</Text>
            <View style={styles.actionsList}>
              <ActionCard
                icon="cash-outline"
                label="Finance & Accounts"
                color="#10B981"
                onPress={() => navigation.navigate('Finance')}
              />
              <ActionCard
                icon="settings-outline"
                label="Application Settings"
                color="#4F46E5"
                onPress={() => navigation.navigate('Settings')}
              />
              <ActionCard
                icon="help-circle-outline"
                label="Help & Support Center"
                color="#F59E0B"
                onPress={() => navigation.navigate('HelpSupport')}
              />
            </View>

            {/* Personal Information */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: spacing.xl }]}>Personal Information</Text>
            <CustomCard style={styles.card}>
              <View style={[styles.infoItem, { borderBottomColor: colors.gray100 }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Full Name</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user?.name}</Text>
                </View>
              </View>
              <View style={[styles.infoItem, { borderBottomColor: colors.gray100 }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email Address</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user?.email}</Text>
                </View>
              </View>
              <View style={[styles.infoItem, { borderBottomColor: colors.gray100 }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="call-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user?.phone}</Text>
                </View>
              </View>
              <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Office Location</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user?.address}</Text>
                </View>
              </View>
            </CustomCard>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: isDarkMode ? colors.error + '20' : colors.error + '10' }]}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={[styles.logoutBtnText, { color: colors.error }]}>
                {loggingOut ? 'Signing out...' : 'Sign Out Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.primary }]}>ILM Possible Education</Text>
              <Text style={[styles.footerSubtext, { color: colors.textTertiary }]}>v1.0.0 Premium Admin Suite</Text>
            </View>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  card: { marginBottom: 24, padding: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1 },
  infoIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  actionsList: { marginBottom: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 12, marginBottom: 20, gap: 12 },
  logoutBtnText: { fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  footerText: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  footerSubtext: { fontSize: 11, marginTop: 2 },
});

export default AdminProfileScreen;
