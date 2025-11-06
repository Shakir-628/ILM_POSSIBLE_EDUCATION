import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import CustomCard from '../../components/CustomCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { icon: 'person-outline', label: 'Name', value: user?.name },
        { icon: 'mail-outline', label: 'Email', value: user?.email },
        { icon: 'call-outline', label: 'Phone', value: user?.phone || 'Not set' },
        { icon: 'location-outline', label: 'Address', value: user?.address || 'Not set' },
      ],
    },
    {
      title: 'Academic Information',
      items: [
        { icon: 'school-outline', label: 'Student ID', value: user?.studentId },
        { icon: 'book-outline', label: 'Class', value: user?.class },
        { icon: 'grid-outline', label: 'Section', value: user?.section || 'N/A' },
        { icon: 'calendar-outline', label: 'Roll Number', value: user?.rollNumber },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#4F46E5', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </LinearGradient>

      {/* Digital ID Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Digital ID Card</Text>
        <CustomCard style={styles.idCard}>
          <View style={styles.idCardContent}>
            <View style={styles.idCardHeader}>
              <Text style={styles.schoolName}>ILM Possible Education</Text>
              <Text style={styles.idCardTitle}>Student ID Card</Text>
            </View>
            <View style={styles.idCardBody}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={user?.studentId || user?._id || 'N/A'}
                  size={100}
                  color="#1f2937"
                  backgroundColor="white"
                />
              </View>
              <View style={styles.idDetails}>
                <Text style={styles.idName}>{user?.name}</Text>
                <Text style={styles.idNumber}>{user?.studentId}</Text>
                <Text style={styles.idClass}>{user?.class} {user?.section}</Text>
              </View>
            </View>
          </View>
        </CustomCard>
      </View>

      {/* Profile Sections */}
      {profileSections.map((section, sIndex) => (
        <View key={sIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <CustomCard>
            {section.items.map((item, iIndex) => (
              <View
                key={iIndex}
                style={[
                  styles.infoItem,
                  iIndex < section.items.length - 1 && styles.infoItemBorder,
                ]}
              >
                <View style={styles.infoLeft}>
                  <Ionicons name={item.icon} size={20} color="#6b7280" />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
                <Text style={styles.infoValue}>{item.value || 'N/A'}</Text>
              </View>
            ))}
          </CustomCard>
        </View>
      ))}

      {/* Logout Button */}
      <View style={styles.section}>
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          icon="log-out-outline"
          fullWidth
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 ILM Possible Education</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  idCard: {
    backgroundColor: '#fff',
  },
  idCardContent: {
    padding: 8,
  },
  idCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  idCardTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 16,
  },
  idDetails: {
    flex: 1,
  },
  idName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  idNumber: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 2,
  },
  idClass: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  versionText: {
    fontSize: 11,
    color: '#d1d5db',
    marginTop: 4,
  },
});

export default ProfileScreen;

