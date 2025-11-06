import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import { Ionicons } from '@expo/vector-icons';

const AboutAppScreen = ({ navigation }) => {
  const features = [
    { icon: 'people-outline', title: 'Student Management', description: 'Comprehensive student information system' },
    { icon: 'calendar-outline', title: 'Attendance Tracking', description: 'Real-time attendance monitoring' },
    { icon: 'book-outline', title: 'Grade Management', description: 'Track academic performance' },
    { icon: 'cash-outline', title: 'Fee Management', description: 'Manage payments and invoices' },
    { icon: 'megaphone-outline', title: 'Announcements', description: 'School-wide communication' },
    { icon: 'card-outline', title: 'Digital ID Cards', description: 'QR code enabled student IDs' },
  ];

  const techStack = [
    { name: 'React Native', icon: 'logo-react', color: '#61DAFB' },
    { name: 'Expo', icon: 'logo-ionic', color: '#000020' },
    { name: 'Node.js', icon: 'logo-nodejs', color: '#68A063' },
    { name: 'MongoDB', icon: 'leaf-outline', color: '#4DB33D' },
  ];

  const developer = {
    name: 'Muhammad Shakir',
    role: 'Full Stack Developer',
    email: 'mshakir628@gmail.com',
    phone: '+92 323 220 7839',
    location: 'Malir, Karachi, Pakistan',
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>ILM</Text>
          </View>
          <Text style={styles.appName}>ILM Possible Education</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* About */}
        <CustomCard style={styles.card}>
          <Text style={styles.aboutText}>
            ILM Possible Education is a comprehensive School Management System designed to streamline educational administration, enhance communication, and improve the overall learning experience for students, teachers, parents, and administrators.
          </Text>
        </CustomCard>

        {/* Features */}
        <Text style={styles.sectionTitle}>Key Features</Text>
        <CustomCard style={styles.card}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </CustomCard>

        {/* Tech Stack */}
        <Text style={styles.sectionTitle}>Built With</Text>
        <CustomCard style={styles.card}>
          <View style={styles.techGrid}>
            {techStack.map((tech, index) => (
              <View key={index} style={styles.techItem}>
                <Ionicons name={tech.icon} size={32} color={tech.color} />
                <Text style={styles.techName}>{tech.name}</Text>
              </View>
            ))}
          </View>
        </CustomCard>

        {/* Developer */}
        <Text style={styles.sectionTitle}>Developer</Text>
        <CustomCard style={styles.card}>
          <View style={styles.developerHeader}>
            <View style={styles.developerAvatar}>
              <Text style={styles.developerInitial}>
                {developer.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>{developer.name}</Text>
              <Text style={styles.developerRole}>{developer.role}</Text>
            </View>
          </View>

          <View style={styles.contactList}>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL(`mailto:${developer.email}`)}
            >
              <Ionicons name="mail" size={20} color="#4F46E5" />
              <Text style={styles.contactText}>{developer.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${developer.phone}`)}
            >
              <Ionicons name="call" size={20} color="#4F46E5" />
              <Text style={styles.contactText}>{developer.phone}</Text>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#4F46E5" />
              <Text style={styles.contactText}>{developer.location}</Text>
            </View>
          </View>
        </CustomCard>

        {/* App Info */}
        <Text style={styles.sectionTitle}>App Information</Text>
        <CustomCard style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Release Date</Text>
            <Text style={styles.infoValue}>January 2025</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native (Expo)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>License</Text>
            <Text style={styles.infoValue}>Proprietary</Text>
          </View>
        </CustomCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="heart" size={20} color="#EF4444" />
          <Text style={styles.footerText}>  Made with love in Pakistan</Text>
        </View>

        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>© 2025 ILM Possible Education</Text>
          <Text style={styles.copyrightSubtext}>All rights reserved</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    paddingTop: 20, 
    paddingBottom: 40, 
    paddingHorizontal: 16,
  },
  backButton: { 
    marginBottom: 24,
    width: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  version: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
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
  aboutText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  featureDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  techItem: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  techName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  developerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  developerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  developerInfo: { flex: 1 },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  developerRole: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contactList: {},
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  copyrightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  copyrightSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default AboutAppScreen;

