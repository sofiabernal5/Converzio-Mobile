// app/inbox.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';
import { API_BASE_URL } from './config/api';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  subject: string;
  content: string;
  senderName: string;
  senderEmail: string;
  timestamp: Date;
  isRead: boolean;
  type: 'system' | 'support' | 'notification' | 'update';
  priority: 'low' | 'medium' | 'high';
}

interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

type FilterType = 'all' | 'unread' | 'system' | 'support';

const STORAGE_KEY = 'converzio_messages';

export default function InboxScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeMessage, setComposeMessage] = useState({
    subject: '',
    content: '',
    recipientEmail: 'support@converzio.com',
  });

  useEffect(() => {
    loadUserData();
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, currentFilter, searchQuery]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setUserInfo(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch(`${API_BASE_URL}/api/messages/${userInfo?.id}`);
      // const data = await response.json();
      
      // For now, load from local storage or use mock data
      const storedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } else {
        // Generate mock messages for demo
        const mockMessages = generateMockMessages();
        setMessages(mockMessages);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const generateMockMessages = (): Message[] => {
    const mockMessages: Message[] = [
      {
        id: '1',
        subject: 'Welcome to Converzio!',
        content: 'Thank you for joining Converzio! We\'re excited to help you create amazing AI-powered videos. To get started, try creating your first avatar in the home screen. If you have any questions, don\'t hesitate to reach out to our support team.',
        senderName: 'Converzio Team',
        senderEmail: 'welcome@converzio.com',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        type: 'system',
        priority: 'medium',
      },
      {
        id: '2',
        subject: 'Avatar Creation Tips',
        content: 'Here are some tips for creating high-quality avatars:\n\n1. Use a clear, well-lit photo\n2. Face the camera directly\n3. Keep the background simple\n4. Ensure good audio quality for voice samples\n\nFollowing these guidelines will help create more realistic and engaging avatars.',
        senderName: 'Support Team',
        senderEmail: 'support@converzio.com',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        type: 'support',
        priority: 'low',
      },
      {
        id: '3',
        subject: 'New Features Available!',
        content: 'We\'ve just released some exciting new features:\n\n• Enhanced video quality for avatars\n• New voice customization options\n• Improved mobile app performance\n• Calendar integration for scheduling\n\nUpdate your app to access these features!',
        senderName: 'Product Updates',
        senderEmail: 'updates@converzio.com',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: false,
        type: 'update',
        priority: 'high',
      },
      {
        id: '4',
        subject: 'Monthly Usage Report',
        content: 'Here\'s your monthly activity summary:\n\n• Avatars created: 2\n• Videos generated: 8\n• Total watch time: 45 minutes\n• Profile completeness: 75%\n\nKeep up the great work! Consider completing your profile to unlock additional features.',
        senderName: 'Analytics Team',
        senderEmail: 'analytics@converzio.com',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isRead: true,
        type: 'notification',
        priority: 'low',
      },
      {
        id: '5',
        subject: 'Security Notice',
        content: 'We\'ve detected a login from a new device on your account. If this was you, no action is needed. If you don\'t recognize this activity, please contact our support team immediately.\n\nDevice: iPhone\nLocation: Tallahassee, FL\nTime: Today at 2:30 PM',
        senderName: 'Security Team',
        senderEmail: 'security@converzio.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        type: 'system',
        priority: 'high',
      },
    ];

    return mockMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const filterMessages = () => {
    let filtered = messages;

    // Apply filter
    if (currentFilter !== 'all') {
      if (currentFilter === 'unread') {
        filtered = filtered.filter(msg => !msg.isRead);
      } else {
        filtered = filtered.filter(msg => msg.type === currentFilter);
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.subject.toLowerCase().includes(query) ||
        msg.content.toLowerCase().includes(query) ||
        msg.senderName.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string) => {
    try {
      // TODO: Update on backend
      // await fetch(`${API_BASE_URL}/api/messages/${messageId}/read`, { method: 'PUT' });
      
      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      );
      setMessages(updatedMessages);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      // TODO: Delete on backend
      // await fetch(`${API_BASE_URL}/api/messages/${messageId}`, { method: 'DELETE' });
      
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const sendMessage = async () => {
    if (!composeMessage.subject.trim() || !composeMessage.content.trim()) {
      Alert.alert('Error', 'Please fill in both subject and content');
      return;
    }

    try {
      // TODO: Send message via backend API
      // const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     from: userInfo?.email,
      //     to: composeMessage.recipientEmail,
      //     subject: composeMessage.subject,
      //     content: composeMessage.content,
      //   }),
      // });

      Alert.alert('Message Sent', 'Your message has been sent to our support team. We\'ll get back to you soon!');
      setComposeMessage({ subject: '', content: '', recipientEmail: 'support@converzio.com' });
      setShowComposeModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system': return '⚙️';
      case 'support': return '💬';
      case 'notification': return '🔔';
      case 'update': return '🆕';
      default: return '📧';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.isRead).length;
  };

  const renderFilterButton = (filter: FilterType, label: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        currentFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setCurrentFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        currentFilter === filter && styles.activeFilterButtonText
      ]}>
        {label}
        {filter === 'unread' && getUnreadCount() > 0 && (
          <Text style={styles.unreadBadge}> ({getUnreadCount()})</Text>
        )}
      </Text>
    </TouchableOpacity>
  );

  const renderMessageCard = (message: Message) => (
    <TouchableOpacity
      key={message.id}
      style={[
        styles.messageCard,
        !message.isRead && styles.unreadMessageCard
      ]}
      onPress={() => openMessage(message)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageInfo}>
          <Text style={styles.messageIcon}>{getMessageIcon(message.type)}</Text>
          <View style={styles.messageDetails}>
            <Text style={[
              styles.messageSubject,
              !message.isRead && styles.unreadText
            ]} numberOfLines={1}>
              {message.subject}
            </Text>
            <Text style={styles.messageSender}>
              {message.senderName}
            </Text>
          </View>
        </View>
        <View style={styles.messageMetadata}>
          <View style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityColor(message.priority) }
          ]} />
          <Text style={styles.messageTimestamp}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.messagePreview} numberOfLines={2}>
        {message.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Header with AnimatedBackground */}
        <View style={styles.headerContainer}>
          <AnimatedBackground />
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Inbox</Text>
              <TouchableOpacity onPress={() => setShowComposeModal(true)}>
                <Text style={styles.composeButton}>+ Create</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search messages..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filter Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {renderFilterButton('all', 'All')}
              {renderFilterButton('unread', 'Unread')}
              {renderFilterButton('system', 'System')}
              {renderFilterButton('support', 'Support')}
            </ScrollView>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00b5d9"
            />
          }
        >
          {filteredMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateTitle}>
                {searchQuery.trim() ? 'No matching messages' : currentFilter === 'all' ? 'No messages yet' : `No ${currentFilter} messages`}
              </Text>
              <Text style={styles.emptyStateDescription}>
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms' 
                  : currentFilter === 'all' 
                    ? 'Messages from our team will appear here'
                    : `${currentFilter} messages will appear here when available`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.messagesContainer}>
              {filteredMessages.map(renderMessageCard)}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Message Details Modal */}
      {selectedMessage && (
        <Modal
          visible={showMessageModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowMessageModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeaderContainer}>
              <AnimatedBackground />
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                    <Text style={styles.modalBackText}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      'Delete Message',
                      'Are you sure you want to delete this message?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(selectedMessage.id) }
                      ]
                    );
                  }}>
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.messageDetailHeader}>
                  <Text style={styles.messageDetailSubject}>
                    {selectedMessage.subject}
                  </Text>
                  <Text style={styles.messageDetailSender}>
                    From: {selectedMessage.senderName} ({selectedMessage.senderEmail})
                  </Text>
                  <Text style={styles.messageDetailTimestamp}>
                    {selectedMessage.timestamp.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.messageDetailContent}>
              <Text style={styles.messageDetailText}>
                {selectedMessage.content}
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Compose Message Modal */}
      <Modal
        visible={showComposeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComposeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeaderContainer}>
            <AnimatedBackground />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity onPress={() => setShowComposeModal(false)}>
                  <Text style={styles.modalBackText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Compose Message</Text>
                <TouchableOpacity onPress={sendMessage}>
                  <Text style={styles.modalSendText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView style={styles.composeContent}>
            <View style={styles.composeField}>
              <Text style={styles.composeLabel}>To:</Text>
              <TextInput
                style={styles.composeInput}
                value={composeMessage.recipientEmail}
                onChangeText={(text) => setComposeMessage(prev => ({ ...prev, recipientEmail: text }))}
                placeholder="support@converzio.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.composeField}>
              <Text style={styles.composeLabel}>Subject:</Text>
              <TextInput
                style={styles.composeInput}
                value={composeMessage.subject}
                onChangeText={(text) => setComposeMessage(prev => ({ ...prev, subject: text }))}
                placeholder="Enter subject"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.composeField}>
              <Text style={styles.composeLabel}>Message:</Text>
              <TextInput
                style={[styles.composeInput, styles.composeTextArea]}
                value={composeMessage.content}
                onChangeText={(text) => setComposeMessage(prev => ({ ...prev, content: text }))}
                placeholder="Enter your message..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  composeButton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  filterContainer: {
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeFilterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  unreadBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  unreadMessageCard: {
    borderLeftColor: '#00b5d9',
    backgroundColor: '#f8f9ff',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  messageIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  messageDetails: {
    flex: 1,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  messageSender: {
    fontSize: 14,
    color: '#6c757d',
  },
  messageMetadata: {
    alignItems: 'flex-end',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
  messagePreview: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeaderContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 18,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalSendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageDetailHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  messageDetailSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  messageDetailSender: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  messageDetailTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageDetailContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  messageDetailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  composeContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  composeField: {
    marginBottom: 20,
  },
  composeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  composeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  composeTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});