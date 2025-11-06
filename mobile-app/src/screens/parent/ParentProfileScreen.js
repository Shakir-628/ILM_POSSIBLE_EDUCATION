import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ParentProfileScreen = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>PARENT</Text>
      </LinearGradient>

      <View style={styles.section}>
        <CustomButton
          title="Logout"
          onPress={async () => {
            await logout();
            toast.success('Logged out');
          }}
          variant="outline"
          icon="log-out-outline"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { paddingTop: 20, paddingBottom: 30, alignItems: 'center' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  role: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' },
  section: { padding: 16 },
});

export default ParentProfileScreen;

