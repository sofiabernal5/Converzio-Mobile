// app/home.tsx (Complete file with consistent styling)
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
// import HeyGenAvatarCreator from '../components/HeyGenAvatarCreator';
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  name?: string;
  email?: string;
}

interface Avatar {
  id: string;
  name: string;
  status: string;
  voice: string;
  createdAt: Date;
}

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAvatars, setUserAvatars] = useState<Avatar[]>([]);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user data from AsyncStorage or API
      // const userData = await AsyncStorage.getItem('userInfo');
      // const avatarData = await AsyncStorage.getItem('userAvatars');
      
      // Set user data when available
      // setUserInfo(JSON.parse(userData));
      // setUserAvatars(JSON.parse(avatarData) || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createVideoWithAvatar = (avatar: Avatar) => {
    Alert.alert(
      'Create Video',
      `Creating a video with ${avatar.name}...`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Video creation started') }
      ]
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
            setUserAvatars(prev => prev.filter(avatar => avatar.id !== avatarId));
          }
        }
      ]
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
      <View style={styles.mainContainer}>
        {/* Header with Blue Gradient */}
        <LinearGradient
          colors={['#4a90e2', '#357abd']}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>
            Welcome{userInfo?.name ? `, ${userInfo.name}` : ''}!
          </Text>
          <Text style={styles.headerSubtitle}>
            Create amazing videos with AI avatars
          </Text>
        </LinearGradient>

        {/* White Background Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowAvatarCreator(true)}
              >
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionTitle}>Create Avatar</Text>
                  <Text style={styles.actionDescription}>
                    Create your personalized AI avatar
                  </Text>
                </LinearGradient>
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
                <LinearGradient
                  colors={userAvatars.length === 0 ? ['#cccccc', '#999999'] : ['#28a745', '#20c997']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionTitle}>Create Video</Text>
                  <Text style={styles.actionDescription}>
                    Generate videos with your avatars
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Avatars Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Avatars</Text>
            
            {userAvatars.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Avatars Yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Get started by creating your first AI avatar. It only takes a few minutes!
                </Text>
                <TouchableOpacity
                  style={styles.createFirstAvatarButton}
                  onPress={() => setShowAvatarCreator(true)}
                >
                  <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    style={styles.createFirstAvatarButtonGradient}
                  >
                    <Text style={styles.createFirstAvatarButtonText}>Create Your First Avatar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.avatarGrid}>
                {userAvatars.map((avatar) => (
                  <View key={avatar.id} style={styles.avatarCard}>
                    <View style={styles.avatarInfo}>
                      <Text style={styles.avatarName}>{avatar.name}</Text>
                      <Text style={styles.avatarStatus}>Status: {avatar.status}</Text>
                      <Text style={styles.avatarVoice}>Voice: {avatar.voice}</Text>
                    </View>
                    <View style={styles.avatarActions}>
                      <TouchableOpacity
                        style={styles.useAvatarButton}
                        onPress={() => createVideoWithAvatar(avatar)}
                      >
                        <LinearGradient
                          colors={['#4a90e2', '#357abd']}
                          style={styles.useAvatarButtonGradient}
                        >
                          <Text style={styles.useAvatarButtonText}>Use Avatar</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.deleteAvatarButton}
                        onPress={() => deleteAvatar(avatar.id)}
                      >
                        <LinearGradient
                          colors={['#dc3545', '#c82333']}
                          style={styles.deleteAvatarButtonGradient}
                        >
                          <Text style={styles.deleteAvatarButtonText}>Delete</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform Features</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>AI-Powered Avatars</Text>
                  <Text style={styles.featureDescription}>
                    Create realistic digital versions of yourself using advanced AI technology
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Professional Quality</Text>
                  <Text style={styles.featureDescription}>
                    Generate high-quality videos perfect for business and professional use
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Fast Generation</Text>
                  <Text style={styles.featureDescription}>
                    Create videos in minutes, not hours. Scale your content production effortlessly
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    flex: 1,
  },
  disabledCard: {
    opacity: 0.6,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  createFirstAvatarButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createFirstAvatarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    gap: 8,
  },
  useAvatarButton: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  useAvatarButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  useAvatarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteAvatarButton: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  deleteAvatarButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    backgroundColor: '#667eea',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
});