import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnnouncementCard from '../../components/AnnouncementCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { announcementService } from '../../services/announcementService';
import { useToast } from '../../context/ToastContext';
import { colors, spacing, fontSize, fontWeight } from '../../utils/designSystem';

const AnnouncementsScreen = ({ navigation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementService.getAllAnnouncements();
      const announcementsList = Array.isArray(data) ? data : data.data || [];
      setAnnouncements(announcementsList);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const renderAnnouncement = ({ item }) => (
    <AnnouncementCard
      announcement={item}
      onPress={(announcement) => {
        navigation.navigate('AnnouncementDetail', { announcement });
      }}
      style={styles.card}
    />
  );

  if (loading) {
    return <Loading message="Loading announcements..." />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>{announcements.length} total announcements</Text>
        </View>
      </LinearGradient>

      {announcements.length === 0 ? (
        <EmptyState 
          icon="megaphone-outline" 
          title="No Announcements" 
          message="No announcements have been posted yet" 
        />
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncement}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: { 
    padding: spacing.xxl, 
    paddingTop: spacing.xl, 
    paddingBottom: spacing.xxl, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { 
    marginRight: spacing.lg 
  },
  headerContent: { 
    flex: 1 
  },
  headerTitle: { 
    fontSize: fontSize.xxxl, 
    fontWeight: fontWeight.bold, 
    color: colors.white 
  },
  headerSubtitle: { 
    fontSize: fontSize.base, 
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs 
  },
  list: { 
    padding: spacing.lg 
  },
  card: { 
    marginBottom: 0 
  },
});

export default AnnouncementsScreen;

