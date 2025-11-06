import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/CustomCard';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';

const HelpSupportScreen = ({ navigation }) => {
  const toast = useToast();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactMethods = [
    {
      icon: 'call',
      title: 'Phone Support',
      subtitle: '0323-2207839',
      action: () => Linking.openURL('tel:03232207839'),
      color: '#10B981',
    },
    {
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      subtitle: '+92 343 346 3246',
      action: () => Linking.openURL('https://wa.me/923433463246'),
      color: '#25D366',
    },
    {
      icon: 'mail',
      title: 'Email Support',
      subtitle: 'mshakir628@gmail.com',
      action: () => Linking.openURL('mailto:mshakir628@gmail.com'),
      color: '#4F46E5',
    },
    {
      icon: 'location',
      title: 'Visit Us',
      subtitle: 'Malir, Karachi',
      action: () => toast.info('Salman Tower, Flat # A-211, Malir Karachi'),
      color: '#EF4444',
    },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Login screen > Tap "Forgot Password?" > Enter your email > Check your inbox for reset link.',
    },
    {
      question: 'How do I update student information?',
      answer: 'Navigate to Students List > Select a student > Tap Edit > Make changes > Save. (Note: This feature is currently available on the web app)',
    },
    {
      question: 'Can I view attendance history?',
      answer: 'Yes! Go to Dashboard > Attendance section > View daily, weekly, or monthly attendance records.',
    },
    {
      question: 'How do I create an announcement?',
      answer: 'Currently, announcements can be created from the web application. Mobile app allows viewing announcements.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures. Your data is stored securely and never shared with third parties.',
    },
    {
      question: 'How do I contact technical support?',
      answer: 'Use any of the contact methods above - phone, WhatsApp, or email. We typically respond within 24 hours.',
    },
  ];

  const ContactCard = ({ icon, title, subtitle, action, color }) => (
    <TouchableOpacity style={styles.contactCard} onPress={action}>
      <View style={[styles.contactIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  const FaqItem = ({ question, answer, index }) => {
    const isExpanded = expandedFaq === index;
    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => setExpandedFaq(isExpanded ? null : index)}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqIconContainer}>
            <Ionicons 
              name={isExpanded ? 'remove-circle' : 'add-circle'} 
              size={24} 
              color="#4F46E5" 
            />
          </View>
          <Text style={styles.faqQuestion}>{question}</Text>
        </View>
        {isExpanded && (
          <Text style={styles.faqAnswer}>{answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>We're here to help you</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Contact Methods */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <CustomCard style={styles.card}>
          {contactMethods.map((method, index) => (
            <ContactCard key={index} {...method} />
          ))}
        </CustomCard>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <CustomCard style={styles.card}>
          {faqs.map((faq, index) => (
            <FaqItem key={index} {...faq} index={index} />
          ))}
        </CustomCard>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <CustomCard style={styles.card}>
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons name="document-text-outline" size={20} color="#4F46E5" />
            <Text style={styles.linkText}>User Guide</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons name="video-outline" size={20} color="#4F46E5" />
            <Text style={styles.linkText}>Video Tutorials</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons name="bug-outline" size={20} color="#4F46E5" />
            <Text style={styles.linkText}>Report a Bug</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </CustomCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="heart" size={16} color="#EF4444" />
          <Text style={styles.footerText}>  Built with care by Muhammad Shakir</Text>
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
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  card: { marginBottom: 20 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: { flex: 1 },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIconContainer: {
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 8,
    marginLeft: 36,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default HelpSupportScreen;

