import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import useThemedStyles from '../../utils/useThemedStyles';
import BiometricService from '../../services/biometricService';

const SettingsScreen = ({ navigation }) => {
  const toast = useToast();
  const { user } = useAuth();
  const { isDarkMode, isSystemTheme, toggleTheme, setThemeMode, theme } = useTheme();
  const { colors, gradients } = useThemedStyles();

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoSync: true,
    biometric: false,
  });

  const [biometricInfo, setBiometricInfo] = useState({
    supported: false,
    enrolled: false,
    typeName: 'Biometric',
    enabled: false,
  });

  const [loadingBiometric, setLoadingBiometric] = useState(false);

  useEffect(() => {
    loadBiometricInfo();
  }, []);

  const loadBiometricInfo = async () => {
    try {
      const info = await BiometricService.getDeviceBiometricInfo();
      setBiometricInfo(info);
      setSettings(prev => ({ ...prev, biometric: info.enabled }));
    } catch (error) {
      console.error('Error loading biometric info:', error);
    }
  };

  const handleBiometricToggle = async () => {
    if (loadingBiometric) return;

    setLoadingBiometric(true);

    try {
      if (!biometricInfo.supported) {
        Alert.alert(
          'Not Supported',
          'Your device does not support biometric authentication.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!biometricInfo.enrolled) {
        Alert.alert(
          'Setup Required',
          `Please set up ${biometricInfo.typeName} in your device settings first.`,
          [{ text: 'OK' }]
        );
        return;
      }

      if (settings.biometric) {
        // Disable biometric
        Alert.alert(
          'Disable Biometric Login',
          `Are you sure you want to disable ${biometricInfo.typeName} login?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                const result = await BiometricService.disableBiometricLogin();
                if (result.success) {
                  setSettings(prev => ({ ...prev, biometric: false }));
                  setBiometricInfo(prev => ({ ...prev, enabled: false }));
                  toast.success('Biometric login disabled');
                } else {
                  toast.error(result.error || 'Failed to disable biometric login');
                }
              },
            },
          ]
        );
      } else {
        // Enable biometric - need credentials
        Alert.alert(
          'Enable Biometric Login',
          `To enable ${biometricInfo.typeName} login, please enter your password.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate('EnableBiometric', {
                  onSuccess: async () => {
                    await loadBiometricInfo();
                    toast.success(`${biometricInfo.typeName} login enabled`);
                  },
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      toast.error('An error occurred');
    } finally {
      setLoadingBiometric(false);
    }
  };

  const toggleSetting = (key) => {
    if (key === 'biometric') {
      handleBiometricToggle();
      return;
    }

    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} ${settings[key] ? 'disabled' : 'enabled'}`);
  };

  const handleThemeModeChange = async (mode) => {
    await setThemeMode(mode);
    const modeNames = { light: 'Light', dark: 'Dark', system: 'System' };
    toast.success(`Theme set to ${modeNames[mode]}`);
  };

  const SettingItem = ({ icon, title, description, value, onToggle }) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.gray200 }]}>
      <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
        {description && <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.gray300, true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : colors.gray100}
      />
    </View>
  );

  const MenuButton = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity style={[styles.menuButton, { borderBottomColor: colors.gray200 }]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: `${color || colors.primary}15` }]}>
        <Ionicons name={icon} size={22} color={color || colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
    </TouchableOpacity>
  );

  const ThemeModeOption = ({ mode, label, icon }) => {
    const isSelected = isSystemTheme ? mode === 'system' : theme === mode;

    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            borderColor: isSelected ? colors.primary : colors.gray300,
            backgroundColor: isSelected ? `${colors.primary}10` : colors.cardBackground,
          }
        ]}
        onPress={() => handleThemeModeChange(mode)}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
        <Text style={[
          styles.themeLabel,
          { color: isSelected ? colors.primary : colors.textPrimary }
        ]}>
          {label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
        <CustomCard style={styles.card}>
          <View style={styles.themeModeContainer}>
            <ThemeModeOption mode="light" label="Light" icon="sunny-outline" />
            <ThemeModeOption mode="dark" label="Dark" icon="moon-outline" />
            <ThemeModeOption mode="system" label="System" icon="phone-portrait-outline" />
          </View>
        </CustomCard>


        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notifications</Text>
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

        {/* Data & Storage */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Data & Storage</Text>
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
            color={colors.error}
            onPress={() => toast.success('Cache cleared')}
          />
        </CustomCard>

        {/* Security */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security</Text>
        <CustomCard style={styles.card}>
          <SettingItem
            icon="finger-print"
            title={`${biometricInfo.typeName} Login`}
            description={
              !biometricInfo.supported
                ? 'Not supported on this device'
                : !biometricInfo.enrolled
                  ? `Set up ${biometricInfo.typeName} in device settings`
                  : `Use ${biometricInfo.typeName} to login`
            }
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
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
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
  container: { flex: 1 },
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
    marginBottom: 12,
    marginTop: 8,
  },
  card: { marginBottom: 20 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: { flex: 1 },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeModeContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SettingsScreen;
