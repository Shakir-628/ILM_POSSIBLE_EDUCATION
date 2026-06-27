import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messageService } from '../../services/messageService';
import GradientHeader from '../../components/GradientHeader';
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { format } from 'date-fns';

const MessagesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('inbox'); // inbox, sent

  useEffect(() => {
    fetchMessages();
  }, [tab]);

  const fetchMessages = async () => {
    try {
      const response = tab === 'inbox' 
        ? await messageService.getInbox() 
        : await messageService.getSentMessages();
      
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const renderMessageItem = ({ item }) => {
    const user = tab === 'inbox' ? item.sender : item.recipient;
    const isUnread = tab === 'inbox' && item.status !== 'read';

    return (
      <TouchableOpacity
        onPress={() => Alert.alert('Message Content', item.content)}
      >
        <CustomCard style={[styles.messageCard, isUnread && styles.unreadCard]}>
          <View style={styles.messageHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
              </View>
              <View>
                <Text style={[styles.userName, isUnread && styles.unreadText]}>
                  {user?.name || 'Unknown'}
                </Text>
                <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.messageTime}>
              {format(new Date(item.createdAt), 'MMM d, h:mm a')}
            </Text>
          </View>
          <Text style={styles.messageSubject}>{item.subject}</Text>
          <Text style={styles.messageSnippet} numberOfLines={2}>
            {item.content}
          </Text>
        </CustomCard>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) return <Loading message="Loading messages..." />;

  return (
    <View style={styles.container}>
      <GradientHeader title="Messages" />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'inbox' && styles.activeTab]}
          onPress={() => setTab('inbox')}
        >
          <Text style={[styles.tabText, tab === 'inbox' && styles.activeTabText]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'sent' && styles.activeTab]}
          onPress={() => setTab('sent')}
        >
          <Text style={[styles.tabText, tab === 'sent' && styles.activeTabText]}>Sent</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="mail-outline"
            title="No Messages"
            message={`You have no messages in your ${tab}`}
          />
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert('New Message', 'New message functionality coming soon')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  listContent: {
    padding: 16,
  },
  messageCard: {
    marginBottom: 12,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  userRole: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '700',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  messageSnippet: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MessagesScreen;
