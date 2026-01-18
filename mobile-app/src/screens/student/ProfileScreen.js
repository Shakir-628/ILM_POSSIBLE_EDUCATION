import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import CustomCard from '../../components/CustomCard';
import CurvedHeader from '../../components/CurvedHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../utils/designSystem';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { colors, isDarkMode } = useDesignSystem();
  const [downloading, setDownloading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleDownloadID = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      toast.info('Generating your PDF ID card...');

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Helvetica', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f3f4f6; padding: 20px; }
              .card { width: 350px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
              .header { background: ${colors.primary}; padding: 25px; text-align: center; color: white; }
              .school-name { font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 1px; }
              .card-title { font-size: 11px; opacity: 0.8; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
              .content { padding: 30px; display: flex; flex-direction: column; align-items: center; text-align: center; }
              .avatar { width: 110px; height: 110px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-top: -55px; background: #eee; object-fit: cover; }
              .name { font-size: 24px; font-weight: bold; color: #111827; margin: 20px 0 8px 0; }
              .student-id { font-size: 18px; color: ${colors.primary}; font-weight: 700; margin-bottom: 12px; }
              .details { font-size: 15px; color: #4b5563; margin-bottom: 25px; line-height: 1.5; }
              .footer { background: #f9fafb; padding: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #6b7280; line-height: 1.4; }
              .validity { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <p class="school-name">ILM POSSIBLE EDUCATION</p>
                <p class="card-title">Official Digital Identity</p>
              </div>
              <div class="content">
                <img src="${user?.photo || 'https://ui-avatars.com/api/?name=' + user?.name + '&background=6366f1&color=fff&size=200'}" class="avatar" />
                <div class="name">${user?.name}</div>
                <div class="student-id">STUDENT ID: ${user?.studentId || 'N/A'}</div>
                <div class="details">
                  Grade: ${user?.class} ${user?.section || ''}<br/>
                  Campus: ILM Possible Main
                </div>
                <span class="validity">VALID SESSION: 2025-2026</span>
              </div>
              <div class="footer">
                ILM Possible Education Digital Suite<br/>
                This is a secure electronic document. Verify via QR code.
              </div>
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html: htmlContent });
        toast.success('Print dialog opened. Select "Save as PDF" to download.');
      } else {
        const result = await Print.printToFileAsync({ html: htmlContent });

        if (!result) {
          throw new Error('PDF generation returned no result');
        }

        const { uri } = result;

        // Move to a friendlier filename for the "Download" experience
        const fileName = `ID_Card_${user?.name?.replace(/\s+/g, '_')}_${user?.studentId}.pdf`;
        const newUri = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.moveAsync({
          from: uri,
          to: newUri
        });

        await Sharing.shareAsync(newUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Download Student ID Card'
        });
      }
    } catch (error) {
      console.error('ID Generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
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

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { icon: 'person-outline', label: 'Full Name', value: user?.name },
        { icon: 'mail-outline', label: 'Email Address', value: user?.email },
        { icon: 'call-outline', label: 'Contact Number', value: user?.phone || 'Not set' },
        { icon: 'location-outline', label: 'Residential Address', value: user?.address || 'Not set' },
      ],
    },
    {
      title: 'Academic Profile',
      items: [
        { icon: 'id-card-outline', label: 'Student ID', value: user?.studentId },
        { icon: 'school-outline', label: 'Current Class', value: user?.class },
        { icon: 'grid-outline', label: 'Section', value: user?.section || 'N/A' },
        { icon: 'calendar-outline', label: 'Academic Year', value: '2025-26' },
      ],
    },
  ];

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
          subtitle="Manage your student identity"
          showProfile={false}
        />

        <View style={styles.overlapContent}>
          {/* Profile Card Overlay */}
          <View style={styles.profileHeaderOverlay}>
            <View style={[styles.avatarWrapper, { borderColor: colors.cardBackground, ...shadows.medium }]}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarLetter}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfoText}>
              <Text style={[styles.headerName, { color: colors.textPrimary }]}>{user?.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>ACTIVE STUDENT</Text>
              </View>
            </View>
          </View>

          {/* Digital ID Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Digital Identity</Text>
              <TouchableOpacity onPress={handleDownloadID} style={styles.downloadLink} disabled={downloading}>
                <Ionicons name={downloading ? "sync" : "download-outline"} size={18} color={colors.primary} />
                <Text style={[styles.downloadText, { color: colors.primary }]}>{downloading ? 'Generating...' : 'Download PDF'}</Text>
              </TouchableOpacity>
            </View>
            <CustomCard style={[styles.idCard, { backgroundColor: colors.cardBackground, ...shadows.small }]}>
              <View style={styles.idCardContent}>
                <View style={[styles.idCardHeader, { borderBottomColor: colors.primary }]}>
                  <Text style={[styles.schoolName, { color: colors.primary }]}>ILM POSSIBLE EDUCATION</Text>
                  <Text style={[styles.idCardTitle, { color: colors.textSecondary }]}>OFFICIAL STUDENT ID</Text>
                </View>
                <View style={styles.idCardBody}>
                  <View style={[styles.qrContainer, { backgroundColor: colors.white }]}>
                    <QRCode
                      value={user?.studentId || user?._id || 'N/A'}
                      size={80}
                      color="#000"
                      backgroundColor="transparent"
                    />
                  </View>
                  <View style={styles.idDetails}>
                    <Text style={[styles.idName, { color: colors.textPrimary }]}>{user?.name}</Text>
                    <Text style={[styles.idNumber, { color: colors.primary }]}>{user?.studentId}</Text>
                    <Text style={[styles.idClass, { color: colors.textSecondary }]}>{user?.class} {user?.section}</Text>
                  </View>
                </View>
              </View>
            </CustomCard>

            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
              onPress={handleDownloadID}
              disabled={downloading}
            >
              <Ionicons name={downloading ? "sync" : "cloud-download-outline"} size={20} color={colors.primary} />
              <Text style={[styles.downloadBtnText, { color: colors.primary }]}>
                {downloading ? 'Preparing Download...' : 'Download Official ID Card'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Sections */}
          {profileSections.map((section, sIndex) => (
            <View key={sIndex} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
              <CustomCard style={{ padding: 4 }}>
                {section.items.map((item, iIndex) => (
                  <View key={iIndex} style={[styles.infoRow, iIndex !== section.items.length - 1 && { borderBottomColor: colors.gray100, borderBottomWidth: 1 }]}>
                    <View style={styles.infoLabelGroup}>
                      <Ionicons name={item.icon} size={18} color={colors.primary} style={styles.rowIcon} />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    </View>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{item.value || 'N/A'}</Text>
                  </View>
                ))}
              </CustomCard>
            </View>
          ))}

          {/* Action Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: isDarkMode ? colors.error + '20' : colors.error + '10' }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.logoutBtnText, { color: colors.error }]}>Sign Out Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>© 2026 ILM Possible Education</Text>
            <Text style={[styles.versionText, { color: colors.textTertiary }]}>Build Version 1.0.0-PRO</Text>
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
  avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  headerInfoText: { marginLeft: 16, marginTop: 40, flex: 1 },
  headerName: { fontSize: 22, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  headerStatus: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  downloadLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  downloadText: { fontSize: 13, fontWeight: '600' },
  idCard: { borderRadius: 16 },
  idCardContent: { padding: 12 },
  idCardHeader: { alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1.5 },
  schoolName: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  idCardTitle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  idCardBody: { flexDirection: 'row', alignItems: 'center' },
  qrContainer: { padding: 10, borderRadius: 12, marginRight: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  idDetails: { flex: 1 },
  idName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  idNumber: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  idClass: { fontSize: 14, fontWeight: '500' },
  downloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, marginTop: 16, borderWidth: 1, borderStyle: 'dashed', gap: 10 },
  downloadBtnText: { fontSize: 14, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  infoLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 12 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  logoutSection: { padding: 24, marginTop: 10 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 12 },
  logoutBtnText: { fontSize: 16, fontWeight: 'bold' },
  footer: { padding: 30, alignItems: 'center' },
  footerText: { fontSize: 12, fontWeight: '600' },
  versionText: { fontSize: 10, marginTop: 4 },
});

export default ProfileScreen;
