import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import CustomCard from '../../components/CustomCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';

const AdminProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      
      // On web, reload the page to clear state
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      toast.error('Failed to logout');
      setLoggingOut(false);
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color="#4F46E5" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Administrator'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role?.toUpperCase() || 'ADMIN'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <CustomCard style={styles.card}>
          <InfoItem 
            icon="person-outline" 
            label="Full Name" 
            value={user?.name} 
          />
          <InfoItem 
            icon="mail-outline" 
            label="Email Address" 
            value={user?.email} 
          />
          <InfoItem 
            icon="call-outline" 
            label="Phone Number" 
            value={user?.phone} 
          />
          <InfoItem 
            icon="location-outline" 
            label="Address" 
            value={user?.address} 
          />
        </CustomCard>

        {/* System Information */}
        <Text style={styles.sectionTitle}>System Information</Text>
        <CustomCard style={styles.card}>
          <InfoItem 
            icon="phone-portrait-outline" 
            label="Platform" 
            value={Platform.OS === 'web' ? 'Web Browser' : Platform.OS === 'ios' ? 'iOS' : 'Android'} 
          />
          <InfoItem 
            icon="code-outline" 
            label="App Version" 
            value="1.0.0" 
          />
        </CustomCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Finance')}
          >
            <Ionicons name="cash-outline" size={28} color="#10B981" />
            <Text style={styles.actionText}>Finance & Accounts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={28} color="#4F46E5" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Ionicons name="help-circle-outline" size={28} color="#4F46E5" />
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="shield-outline" size={28} color="#4F46E5" />
            <Text style={styles.actionText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AboutApp')}
          >
            <Ionicons name="information-circle-outline" size={28} color="#4F46E5" />
            <Text style={styles.actionText}>About App</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          loading={loggingOut}
          variant="outline"
          icon="log-out-outline"
          fullWidth
          style={styles.logoutButton}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ILM Possible Education</Text>
          <Text style={styles.footerSubtext}>© 2025 All rights reserved</Text>
          <Text style={styles.footerSubtext}>Developed by Muhammad Shakir</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  header: { 
    paddingTop: 20, 
    paddingBottom: 30, 
    alignItems: 'center' 
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8 
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { 
    fontSize: 12, 
    color: '#fff', 
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: { 
    padding: 16 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: '2%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});

export default AdminProfileScreen;

