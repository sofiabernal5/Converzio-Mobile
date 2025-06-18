// app/home.tsx (Updated with analytics integration)
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
import { useRouter } from 'expo-router';
import AnalyticsService, { AnalyticsSummary } from '../services/AnalyticsService';

interface UserInfo {
  name?: string;
  email?: string;
}

interface Avatar {
  id: string;
  name: string;
  type: 'photo' | 'video';
  status: string;
  voice: string;
  createdAt: Date;
}

export default function HomeScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAvatars, setUserAvatars] = useState<Avatar[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    loadUserData();
    loadAnalyticsSummary();
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

  const loadAnalyticsSummary = async () => {
    try {
      const summary = await AnalyticsService.getAnalyticsSummary();
      setAnalyticsSummary(summary);
    } catch (error) {
      console.error('Error loading analytics summary:', error);
    }
  };

  const navigateToAvatarSelection = () => {
    router.push('/avatar-selection');
  };

  const navigateToCalendar = () => {
    router.push('/calendar');
  };

  const navigateToAnalytics = () => {
    router.push('/analytics');
  };

  const createVideoWithAvatar = async (avatar: Avatar) => {
    // Create analytics entry for new video
    try {
      const videoTitle = `Video with ${avatar.name}`;
      const videoId = `video_${Date.now()}`;
      
      await AnalyticsService.createVideoAnalytics(videoId, videoTitle);
      
      // Simulate video creation and immediate view
      await AnalyticsService.recordView(videoId, 30, true, 'direct');
      
      Alert.alert(
        'Video Created!',
        `Video "${videoTitle}" has been created and analytics are being tracked.`,
        [
          { text: 'View Analytics', onPress: navigateToAnalytics },
          { text: 'OK' }
        ]
      );
      
      // Refresh analytics summary
      loadAnalyticsSummary();
    } catch (error) {
      console.error('Error creating video:', error);
      Alert.alert('Error', 'Failed to create video. Please try again.');
    }
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

  const renderAnalyticsPreview = () => {
    if (!analyticsSummary || analyticsSummary.totalVideos === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Your Performance</Text>
          <TouchableOpacity onPress={navigateToAnalytics}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.analyticsPreviewCard}
          onPress={navigateToAnalytics}
        >
          <LinearGradient
            colors={['#28a745', '#20c997']}
            style={styles.analyticsGradient}
          >
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{analyticsSummary.totalViews}</Text>
                <Text style={styles.analyticsLabel}>Total Views</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{analyticsSummary.totalVideos}</Text>
                <Text style={styles.analyticsLabel}>Videos</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{analyticsSummary.averageEngagementRate}%</Text>
                <Text style={styles.analyticsLabel}>Engagement</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{analyticsSummary.totalEngagementActions}</Text>
                <Text style={styles.analyticsLabel}>Interactions</Text>
              </View>
            </View>
            <Text style={styles.analyticsFooter}>Tap to view detailed analytics</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

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
                onPress={navigateToAvatarSelection}
              >
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionTitle}>Create Digital Avatar</Text>
                  <Text style={styles.actionDescription}>
                    Choose between photo or video avatar creation
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

          {/* Analytics Preview */}
          {renderAnalyticsPreview()}

          {/* My Avatars Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Avatars</Text>
            
            {userAvatars.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Avatars Yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Get started by creating your first AI avatar. Choose between a quick photo avatar or a premium video avatar!
                </Text>
                <TouchableOpacity
                  style={styles.createFirstAvatarButton}
                  onPress={navigateToAvatarSelection}
                >
                  <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    style={styles.createFirstAvatarButtonGradient}
                  >
                    <Text style={styles.createFirstAvatarButtonText}>
                      Create Your First Avatar
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
                      <Text style={styles.avatarType}>Type: {avatar.type === 'photo' ? 'Photo Avatar' : 'Video Avatar'}</Text>
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
                  <Text style={styles.featureTitle}>Analytics Dashboard</Text>
                  <Text style={styles.featureDescription}>
                    Track video performance with detailed analytics including views, engagement, and watch time
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Two Creation Methods</Text>
                  <Text style={styles.featureDescription}>
                    Choose between quick photo avatars or premium video avatars for different use cases
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
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation Toolbar */}
        <View style={styles.bottomToolbar}>
          <TouchableOpacity 
            style={styles.toolbarItem}
            onPress={navigateToCalendar}
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
            onPress={navigateToAnalytics}
          >
            <View style={styles.toolbarIcon}>
              <View style={styles.chartIcon}>
                <View style={[styles.chartBar, { height: 8 }]} />
                <View style={[styles.chartBar, { height: 12 }]} />
                <View style={[styles.chartBar, { height: 6 }]} />
              </View>
            </View>
            <Text style={styles.toolbarLabel}>Analytics</Text>
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
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
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
  analyticsPreviewCard: {
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
  analyticsGradient: {
    padding: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  analyticsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  analyticsFooter: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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
  avatarType: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 4,
    fontWeight: '500',
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