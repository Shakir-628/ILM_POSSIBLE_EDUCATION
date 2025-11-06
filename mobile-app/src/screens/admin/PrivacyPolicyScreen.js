import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information that you provide directly to us, including:\n\n• Personal identification information (name, email address, phone number)\n• Academic information (student ID, class, grades, attendance)\n• Usage data and app interaction information\n• Device information and IP addresses',
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Process transactions and send related information\n• Send administrative information and updates\n• Respond to your comments and questions\n• Monitor and analyze trends, usage, and activities',
    },
    {
      title: '3. Information Sharing',
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share information:\n\n• With your consent\n• With service providers who assist in operations\n• To comply with legal obligations\n• To protect our rights and safety',
    },
    {
      title: '4. Data Security',
      content: 'We implement appropriate technical and organizational security measures to protect your personal information, including:\n\n• Encryption of data in transit and at rest\n• Regular security assessments\n• Access controls and authentication\n• Secure data storage practices',
    },
    {
      title: '5. Your Rights',
      content: 'You have the right to:\n\n• Access your personal information\n• Request correction of inaccurate data\n• Request deletion of your data\n• Object to processing of your data\n• Data portability\n• Withdraw consent at any time',
    },
    {
      title: '6. Data Retention',
      content: 'We retain your personal information for as long as necessary to:\n\n• Provide our services\n• Comply with legal obligations\n• Resolve disputes\n• Enforce our agreements',
    },
    {
      title: '7. Children\'s Privacy',
      content: 'Our service is intended for educational institutions. We collect and process student information only with proper consent from parents/guardians and in compliance with applicable laws including COPPA and GDPR.',
    },
    {
      title: '8. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
    },
    {
      title: '9. Contact Us',
      content: 'If you have any questions about this Privacy Policy, please contact us:\n\n• Email: mshakir628@gmail.com\n• Phone: 0323-2207839\n• Address: Malir, Karachi, Pakistan',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>Last Updated: January 2025</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <CustomCard style={styles.introCard}>
          <Ionicons name="shield-checkmark" size={48} color="#4F46E5" style={styles.icon} />
          <Text style={styles.introText}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our School Management System.
          </Text>
        </CustomCard>

        {sections.map((section, index) => (
          <CustomCard key={index} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </CustomCard>
        ))}

        <CustomCard style={styles.acceptanceCard}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" style={styles.icon} />
          <Text style={styles.acceptanceTitle}>Your Acceptance</Text>
          <Text style={styles.acceptanceText}>
            By using our application, you signify your acceptance of this Privacy Policy. If you do not agree to this policy, please do not use our application.
          </Text>
        </CustomCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 ILM Possible Education</Text>
          <Text style={styles.footerSubtext}>All Rights Reserved</Text>
        </View>
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
  backButton: { marginRight: 16 },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  content: { padding: 16 },
  introCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  acceptanceCard: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  acceptanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  acceptanceText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default PrivacyPolicyScreen;

