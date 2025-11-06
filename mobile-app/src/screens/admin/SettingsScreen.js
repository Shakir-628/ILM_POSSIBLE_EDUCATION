import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';

const SettingsScreen = ({ navigation }) => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoSync: true,
    biometric: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} ${settings[key] ? 'disabled' : 'enabled'}`);
  };

  const SettingItem = ({ icon, title, description, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color="#4F46E5" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
        thumbColor={value ? '#4F46E5' : '#f4f4f5'}
      />
    </View>
  );

  const MenuButton = ({ icon, title, subtitle, onPress, color = '#4F46E5' }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <CustomCard style={styles.card}>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            description="Receive alerts and updates"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
          />
          <SettingItem
            icon="mail-outline"
            title="Email Alerts"
            description="Get important updates via email"
            value={settings.emailAlerts}
            onToggle={() => toggleSetting('emailAlerts')}
          />
        </CustomCard>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <CustomCard style={styles.card}>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            description="Enable dark theme"
            value={settings.darkMode}
            onToggle={() => toggleSetting('darkMode')}
          />
        </CustomCard>

        {/* Data & Storage */}
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        <CustomCard style={styles.card}>
          <SettingItem
            icon="sync-outline"
            title="Auto Sync"
            description="Automatically sync data"
            value={settings.autoSync}
            onToggle={() => toggleSetting('autoSync')}
          />
          <MenuButton
            icon="trash-outline"
            title="Clear Cache"
            subtitle="Free up storage space"
            color="#EF4444"
            onPress={() => toast.success('Cache cleared')}
          />
        </CustomCard>

        {/* Security */}
        <Text style={styles.sectionTitle}>Security</Text>
        <CustomCard style={styles.card}>
          <SettingItem
            icon="finger-print"
            title="Biometric Login"
            description="Use fingerprint or face ID"
            value={settings.biometric}
            onToggle={() => toggleSetting('biometric')}
          />
          <MenuButton
            icon="key-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </CustomCard>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <CustomCard style={styles.card}>
          <MenuButton
            icon="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
          />
          <MenuButton
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => toast.info('Opening Terms of Service')}
          />
          <MenuButton
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
        </CustomCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    paddingTop: 20, 
    paddingBottom: 24, 
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff',
  },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  card: { marginBottom: 20 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: { flex: 1 },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default SettingsScreen;

