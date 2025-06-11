// app/home.tsx (Updated with HeyGen API integration)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

//HEYGEN API: NEED TO MAKE DATA DYNAMIC FOR THE APP
const HEYGEN_API_KEY = 'ZmQxMWE0MjRlNDAzNDAyYmJjZGE2YzZiNzY5MjgzNzUtMTcyMjYxMzM5MQ==';
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAvatars, setUserAvatars] = useState<Avatar[]>([]);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);

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

  const createAvatarWithHeyGen = async () => {
    setIsCreatingAvatar(true);
    
    try {
      const requestBody = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: "Lina_Dress_Sitting_Side_public",
              avatar_style: "normal"
            },
            voice: {
              type: "text",
              input_text: "Welcome to the HeyGen API!",
              voice_id: "119caed25533477ba63822d5d1552d25",
              speed: 1.1
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        }
      };

      console.log('Making request to HeyGen API...');
      
      const response = await fetch(HEYGEN_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        console.log('HeyGen API Success:', responseData);
        
        // Create a new avatar object with the response data
        const newAvatar: Avatar = {
          id: responseData.data?.video_id || `avatar_${Date.now()}`,
          name: `Avatar ${userAvatars.length + 1}`,
          status: 'Generated',
          voice: 'HeyGen Voice',
          createdAt: new Date(),
        };

        // Add the new avatar to the list
        setUserAvatars(prev => [...prev, newAvatar]);
        
        Alert.alert(
          'Success!',
          'Your avatar has been created successfully with HeyGen API!',
          [
            {
              text: 'OK',
              onPress: () => console.log('Avatar creation completed')
            }
          ]
        );
      } else {
        console.error('HeyGen API Error:', responseData);
        Alert.alert(
          'Error',
          `Failed to create avatar: ${responseData.message || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Network Error:', error);
      Alert.alert(
        'Network Error',
        'Failed to connect to HeyGen API. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingAvatar(false);
    }
  };

  const createAvatar = async () => {
    try {
      await createAvatarWithHeyGen();
    } catch (error) {
      console.error("Error creating avatar: ", error);
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

        {/* Loading Overlay */}
        {isCreatingAvatar && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Creating your avatar...</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </View>
          </View>
        )}

        {/* White Background Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[styles.actionCard, isCreatingAvatar && styles.disabledCard]}
                onPress={() => {
                  if (!isCreatingAvatar) {
                    createAvatar();
                  }
                }}
                disabled={isCreatingAvatar}
              >
                <LinearGradient
                  colors={isCreatingAvatar ? ['#cccccc', '#999999'] : ['#4a90e2', '#357abd']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionTitle}>
                    {isCreatingAvatar ? 'Creating...' : 'Create Avatar'}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {isCreatingAvatar 
                      ? 'Please wait while we generate your avatar'
                      : 'Create your personalized AI avatar'
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, (userAvatars.length === 0 || isCreatingAvatar) && styles.disabledCard]}
                onPress={() => {
                  if (userAvatars.length > 0 && !isCreatingAvatar) {
                    Alert.alert('Feature Coming Soon', 'Video creation interface will be available soon!');
                  } else if (userAvatars.length === 0) {
                    Alert.alert('No Avatars', 'Please create an avatar first.');
                  }
                }}
                disabled={isCreatingAvatar}
              >
                <LinearGradient
                  colors={(userAvatars.length === 0 || isCreatingAvatar) ? ['#cccccc', '#999999'] : ['#28a745', '#20c997']}
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
                  style={[styles.createFirstAvatarButton, isCreatingAvatar && styles.disabledCard]}
                  onPress={() => {
                    if (!isCreatingAvatar) {
                      createAvatar();
                    }
                  }}
                  disabled={isCreatingAvatar}
                >
                  <LinearGradient
                    colors={isCreatingAvatar ? ['#cccccc', '#999999'] : ['#4a90e2', '#357abd']}
                    style={styles.createFirstAvatarButtonGradient}
                  >
                    <Text style={styles.createFirstAvatarButtonText}>
                      {isCreatingAvatar ? 'Creating Avatar...' : 'Create Your First Avatar'}
                    </Text>
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
                        disabled={isCreatingAvatar}
                      >
                        <LinearGradient
                          colors={isCreatingAvatar ? ['#cccccc', '#999999'] : ['#4a90e2', '#357abd']}
                          style={styles.useAvatarButtonGradient}
                        >
                          <Text style={styles.useAvatarButtonText}>Use Avatar</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.deleteAvatarButton}
                        onPress={() => deleteAvatar(avatar.id)}
                        disabled={isCreatingAvatar}
                      >
                        <LinearGradient
                          colors={isCreatingAvatar ? ['#cccccc', '#999999'] : ['#dc3545', '#c82333']}
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

        {/* Bottom Navigation Toolbar */}
        <View style={styles.bottomToolbar}>
          <TouchableOpacity 
            style={styles.toolbarItem}
            onPress={() => Alert.alert('Calendar', 'Calendar feature coming soon!')}
          >
            <View style={styles.toolbarIcon}>
              <View style={styles.calendarIcon}>
                <View style={styles.calendarHeader} />
                <View style={styles.calendarBody}>
                  <View style={styles.calendarDot} />
                  <View style={styles.calendarDot} />
                  <View style={styles.calendarDot} />
                </View>
              </View>
            </View>
            <Text style={styles.toolbarLabel}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolbarItem}
            onPress={() => Alert.alert('Video Library', 'Video library feature coming soon!')}
          >
            <View style={styles.toolbarIcon}>
              <View style={styles.videoIcon}>
                <View style={styles.playButton} />
              </View>
            </View>
            <Text style={styles.toolbarLabel}>Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolbarItem}
            onPress={() => Alert.alert('Inbox', 'Inbox feature coming soon!')}
          >
            <View style={styles.toolbarIcon}>
              <View style={styles.inboxIcon}>
                <View style={styles.envelopeFlap} />
              </View>
            </View>
            <Text style={styles.toolbarLabel}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolbarItem}
            onPress={() => Alert.alert('Performance', 'Performance metrics coming soon!')}
          >
            <View style={styles.toolbarIcon}>
              <View style={styles.chartIcon}>
                <View style={[styles.chartBar, { height: 8 }]} />
                <View style={[styles.chartBar, { height: 12 }]} />
                <View style={[styles.chartBar, { height: 6 }]} />
              </View>
            </View>
            <Text style={styles.toolbarLabel}>Metrics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolbarItem}
            onPress={() => Alert.alert('Resources', 'Resource lounge coming soon!')}
          >
            <View style={styles.toolbarIcon}>
              <View style={styles.resourceIcon}>
                <View style={styles.bookSpine} />
                <View style={[styles.bookSpine, { marginLeft: 2 }]} />
              </View>
            </View>
            <Text style={styles.toolbarLabel}>Resources</Text>
          </TouchableOpacity>
        </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
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
  bottomToolbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  toolbarItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  toolbarIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolbarLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  // Calendar Icon
  calendarIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4a90e2',
    borderRadius: 3,
  },
  calendarHeader: {
    width: '100%',
    height: 6,
    backgroundColor: '#357abd',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  calendarBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
  },
  calendarDot: {
    width: 2,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  // Video Icon
  videoIcon: {
    width: 20,
    height: 16,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  // Inbox Icon
  inboxIcon: {
    width: 20,
    height: 14,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
    position: 'relative',
  },
  envelopeFlap: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#357abd',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Chart Icon
  chartIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: 18,
    height: 16,
  },
  chartBar: {
    width: 4,
    backgroundColor: '#4a90e2',
    borderRadius: 1,
  },
  // Resource Icon
  resourceIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 18,
  },
  bookSpine: {
    width: 8,
    height: 18,
    backgroundColor: '#4a90e2',
    borderRadius: 1,
  },
});