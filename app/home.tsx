// app/(tabs)/home.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import HeyGenAvatarCreator from '../../components/HeyGenAvatarCreator';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserAvatar {
  id: string;
  name: string;
  status: string;
  image_url?: string;
  voice_description: string;
  created_at: string;
}

export default function HomeScreen() {
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    loadUserAvatars();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userInfo');
      if (userData) {
        setUserInfo(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserAvatars = async () => {
    try {
      const avatarsData = await AsyncStorage.getItem('userAvatars');
      if (avatarsData) {
        setUserAvatars(JSON.parse(avatarsData));
      }
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  const saveUserAvatars = async (avatars: UserAvatar[]) => {
    try {
      await AsyncStorage.setItem('userAvatars', JSON.stringify(avatars));
      setUserAvatars(avatars);
    } catch (error) {
      console.error('Error saving avatars:', error);
    }
  };

  const handleAvatarCreated = (avatarData: any) => {
    const newAvatar: UserAvatar = {
      ...avatarData,
      created_at: new Date().toISOString(),
    };

    const updatedAvatars = [...userAvatars, newAvatar];
    saveUserAvatars(updatedAvatars);
    setShowAvatarCreator(false);
    
    Alert.alert(
      'Success!',
      'Your avatar has been saved. You can now use it to create videos.',
    );
  };

  const deleteAvatar = (avatarId: string) => {
    Alert.alert(
      'Delete Avatar',
      'Are you sure you want to delete this avatar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedAvatars = userAvatars.filter(avatar => avatar.id !== avatarId);
            saveUserAvatars(updatedAvatars);
          },
        },
      ],
    );
  };

  const createVideoWithAvatar = (avatar: UserAvatar) => {
    // This would navigate to a video creation screen
    Alert.alert(
      'Create Video',
      `Start creating a video with ${avatar.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Video',
          onPress: () => {
            // Navigate to video creation screen
            // router.push(`/create-video?avatarId=${avatar.id}`);
            Alert.alert('Feature Coming Soon', 'Video creation interface will be available soon!');
          },
        },
      ],
    );
  };

  if (showAvatarCreator) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            HeyGen Avatar Creator will be here
          </Text>
          <Text style={styles.placeholderSubtext}>
            Please create the HeyGenAvatarCreator component first
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowAvatarCreator(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>
            Welcome{userInfo?.name ? `, ${userInfo.name}` : ''}!
          </Text>
          <Text style={styles.headerSubtitle}>
            Create amazing videos with AI avatars
          </Text>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowAvatarCreator(true)}
            >
              <Text style={styles.actionIcon}>Avatar</Text>
              <Text style={styles.actionTitle}>Create Avatar</Text>
              <Text style={styles.actionDescription}>
                Create your personalized AI avatar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, userAvatars.length === 0 && styles.disabledCard]}
              onPress={() => {
                if (userAvatars.length > 0) {
                  Alert.alert('Feature Coming Soon', 'Video creation interface will be available soon!');
                } else {
                  Alert.alert('No Avatars', 'Please create an avatar first.');
                }
              }}
            >
              <Text style={styles.actionIcon}>Video</Text>
              <Text style={styles.actionTitle}>Create Video</Text>
              <Text style={styles.actionDescription}>
                Generate videos with your avatars
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Avatars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Avatars ({userAvatars.length})</Text>
          
          {userAvatars.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>No avatars</Text>
              <Text style={styles.emptyStateTitle}>No avatars yet</Text>
              <Text style={styles.emptyStateDescription}>
                Create your first AI avatar to get started with video generation
              </Text>
              <TouchableOpacity
                style={styles.createFirstAvatarButton}
                onPress={() => setShowAvatarCreator(true)}
              >
                <Text style={styles.createFirstAvatarButtonText}>Create Your First Avatar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.avatarGrid}>
              {userAvatars.map((avatar) => (
                <View key={avatar.id} style={styles.avatarCard}>
                  <View style={styles.avatarInfo}>
                    <Text style={styles.avatarName}>{avatar.name}</Text>
                    <Text style={styles.avatarStatus}>
                      Status: {avatar.status.charAt(0).toUpperCase() + avatar.status.slice(1)}
                    </Text>
                    <Text style={styles.avatarVoice}>
                      Voice: {avatar.voice_description.slice(0, 30)}...
                    </Text>
                  </View>
                  
                  <View style={styles.avatarActions}>
                    <TouchableOpacity
                      style={styles.useAvatarButton}
                      onPress={() => createVideoWithAvatar(avatar)}
                    >
                      <Text style={styles.useAvatarButtonText}>Use Avatar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteAvatarButton}
                      onPress={() => deleteAvatar(avatar.id)}
                    >
                      <Text style={styles.deleteAvatarButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Can Do</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>AI</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>AI Avatar Creation</Text>
                <Text style={styles.featureDescription}>
                  Transform your photo into a realistic AI avatar
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>Video</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Video Generation</Text>
                <Text style={styles.featureDescription}>
                  Create professional videos with your avatar
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>Voice</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Custom Voice</Text>
                <Text style={styles.featureDescription}>
                  Personalize your avatar's voice and speaking style
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledCard: {
    opacity: 0.6,
  },
  actionIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createFirstAvatarButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstAvatarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarGrid: {
    gap: 16,
  },
  avatarCard: {
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
  },
  avatarInfo: {
    marginBottom: 16,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  avatarStatus: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 4,
  },
  avatarVoice: {
    fontSize: 14,
    color: '#6c757d',
  },
  avatarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  useAvatarButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  useAvatarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteAvatarButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteAvatarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
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
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});