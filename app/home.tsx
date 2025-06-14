// app/home.tsx (Updated with Backend Integration)
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { TextStyles } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { userService, Avatar, Video } from '../services/userService';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // Local state for user data
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Avatar[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalVideos: number;
    totalViews: number;
    totalAvatars: number;
    recentActivity: Array<{
      id: string;
      type: 'video_created' | 'avatar_created' | 'profile_updated';
      message: string;
      createdAt: string;
    }>;
  }>({
    totalVideos: 0,
    totalViews: 0,
    totalAvatars: 0,
    recentActivity: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
      return;
    }

    if (user) {
      loadUserData();
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user, isLoading]);

  const loadUserData = async () => {
    try {
      setIsLoadingData(true);
      
      // Load user data from backend
      const [avatars, videos, analyticsData] = await Promise.all([
        userService.getAvatars(),
        userService.getVideos(),
        userService.getAnalytics(),
      ]);

      setUserAvatars(avatars);
      setUserVideos(videos);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load your data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCreateAvatar = () => {
    router.push('/create-avatar'); // Navigate to avatar creation screen
  };

  const handleCreateVideo = () => {
    if (userAvatars.length === 0) {
      Alert.alert('No Avatars', 'Please create an avatar first before making videos.');
      return;
    }
    router.push('/create-video'); // Navigate to video creation screen
  };

  const handleDeleteAvatar = async (avatarId: string) => {
    Alert.alert(
      'Delete Avatar',
      'Are you sure you want to delete this avatar?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAvatar(avatarId);
              setUserAvatars(prev => prev.filter(avatar => avatar.id !== avatarId));
              Alert.alert('Success', 'Avatar deleted successfully');
            } catch (error) {
              console.error('Error deleting avatar:', error);
              Alert.alert('Error', 'Failed to delete avatar');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.contentWrapper}>
            <Text style={styles.welcomeText}>
              Welcome Back{user?.name ? `, ${user.name}` : ''}!
            </Text>
            <Text style={styles.sloganText}>
              Your professional branding dashboard
            </Text>
            <View style={styles.separator} />
            
            {/* Analytics Cards */}
            <View style={styles.analyticsContainer}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsNumber}>{analytics.totalAvatars}</Text>
                <Text style={styles.analyticsLabel}>Avatars</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsNumber}>{analytics.totalVideos}</Text>
                <Text style={styles.analyticsLabel}>Videos</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsNumber}>{analytics.totalViews}</Text>
                <Text style={styles.analyticsLabel}>Views</Text>
              </View>
            </View>
            
            {/* Quick Actions */}
            <View style={styles.dashboardContainer}>
              <TouchableOpacity 
                style={styles.featureCard}
                onPress={handleCreateAvatar}>
                <View style={styles.featureCardContent}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.3)', 'rgba(53, 122, 189, 0.3)']}
                    style={styles.featureCardGradient}
                  />
                  <Text style={styles.featureTitle}>Create Avatar</Text>
                  <Text style={styles.featureDescription}>
                    Create your AI-powered digital twin
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featureCard}
                onPress={handleCreateVideo}>
                <View style={styles.featureCardContent}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.3)', 'rgba(53, 122, 189, 0.3)']}
                    style={styles.featureCardGradient}
                  />
                  <Text style={styles.featureTitle}>Create Video</Text>
                  <Text style={styles.featureDescription}>
                    Generate videos with your avatars
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureCardContent}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.3)', 'rgba(53, 122, 189, 0.3)']}
                    style={styles.featureCardGradient}
                  />
                  <Text style={styles.featureTitle}>Analytics</Text>
                  <Text style={styles.featureDescription}>
                    Track your content performance
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* My Avatars Section */}
            {isLoadingData ? (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.loadingSectionText}>Loading your avatars...</Text>
              </View>
            ) : (
              <View style={styles.avatarsSection}>
                <Text style={styles.sectionTitle}>My Avatars ({userAvatars.length})</Text>
                {userAvatars.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No Avatars Yet</Text>
                    <Text style={styles.emptyStateDescription}>
                      Create your first AI avatar to get started
                    </Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {userAvatars.map((avatar) => (
                      <View key={avatar.id} style={styles.avatarCard}>
                        <Text style={styles.avatarName}>{avatar.name}</Text>
                        <Text style={styles.avatarStatus}>
                          Status: {avatar.status}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteAvatarButton}
                          onPress={() => handleDeleteAvatar(avatar.id)}>
                          <Text style={styles.deleteAvatarButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
            
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              disabled={isLoggingOut}>
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  welcomeText: {
    ...TextStyles.heading1,
    textAlign: 'center',
    marginBottom: 10,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sloganText: {
    ...TextStyles.slogan,
    textAlign: 'center',
    marginBottom: 30,
    color: '#ffffff',
    opacity: 0.9,
  },
  separator: {
    height: 2,
    width: 80,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    marginBottom: 40,
    borderRadius: 1,
    opacity: 0.5,
  },
  analyticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  analyticsCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  dashboardContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureCardContent: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  featureCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featureTitle: {
    ...TextStyles.body,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    ...TextStyles.caption,
    color: '#ffffff',
    opacity: 0.8,
  },
  avatarsSection: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    ...TextStyles.body,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
  },
  avatarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 150,
  },
  avatarName: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  avatarStatus: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 12,
    marginBottom: 8,
  },
  deleteAvatarButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteAvatarButtonText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateDescription: {
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TextStyles.body,
    color: '#ffffff',
    marginTop: 16,
    opacity: 0.8,
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingSectionText: {
    color: '#ffffff',
    marginLeft: 12,
    opacity: 0.8,
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    ...TextStyles.caption,
    color: '#ffffff',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
});