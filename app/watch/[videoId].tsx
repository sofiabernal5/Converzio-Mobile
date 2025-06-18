// app/watch/[videoId].tsx - Video viewer with lead capture
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import AnalyticsService from '../../services/AnalyticsService';
import LeadService from '../../services/LeadService';
import LeadCaptureForm from '../../components/LeadCaptureForm';

const { width, height } = Dimensions.get('window');

interface VideoData {
  id: string;
  title: string;
  description?: string;
  creatorName: string;
  creatorEmail?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  createdAt: string;
  isPublic: boolean;
}

export default function VideoViewerScreen() {
  const router = useRouter();
  const { videoId } = useLocalSearchParams();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const [hasWatched50Percent, setHasWatched50Percent] = useState(false);
  const [hasWatchedComplete, setHasWatchedComplete] = useState(false);

  // Mock video data - in real app, this would come from an API
  const mockVideoData: VideoData = {
    id: videoId as string,
    title: 'Welcome to Converzio',
    description: 'Learn how AI avatars can transform your business communication and help you create professional videos at scale.',
    creatorName: 'John Smith',
    creatorEmail: 'john@example.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 120, // 2 minutes
    createdAt: new Date().toISOString(),
    isPublic: true,
  };

  const player = useVideoPlayer(mockVideoData.videoUrl, player => {
    player.loop = false;
    player.play();
  });

  // Track video progress using useEffect
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const currentTime = player.currentTime || 0;
      setWatchTime(currentTime);
      
      // Track 50% completion
      if (currentTime >= mockVideoData.duration * 0.5 && !hasWatched50Percent) {
        setHasWatched50Percent(true);
        recordAnalytics(currentTime, false);
      }
      
      // Track completion
      if (currentTime >= mockVideoData.duration * 0.9 && !hasWatchedComplete) {
        setHasWatchedComplete(true);
        recordAnalytics(currentTime, true);
      }
    }, 1000); // Update every second

    return () => {
      clearInterval(interval);
    };
  }, [player, hasWatched50Percent, hasWatchedComplete]);

  useEffect(() => {
    loadVideoData();
    recordInitialView();
  }, [videoId]);

  const loadVideoData = async () => {
    setIsLoading(true);
    try {
      // In a real app, fetch video data from API
      // const response = await fetch(`/api/videos/${videoId}`);
      // const data = await response.json();
      
      setVideoData(mockVideoData);
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert('Error', 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const recordInitialView = async () => {
    try {
      await AnalyticsService.recordView(videoId as string, 0, false, 'share');
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const recordAnalytics = async (duration: number, completed: boolean) => {
    try {
      await AnalyticsService.recordView(videoId as string, duration, completed, 'share');
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  };

  const handleLikeVideo = async () => {
    try {
      await AnalyticsService.recordEngagement(videoId as string, 'like');
      Alert.alert('Thanks!', 'Your like has been recorded.');
    } catch (error) {
      console.error('Error recording like:', error);
    }
  };

  const handleShareVideo = async () => {
    try {
      await AnalyticsService.recordEngagement(videoId as string, 'share');
      
      const shareUrl = `https://converzio.app/watch/${videoId}`;
      const result = await Share.share({
        message: `Check out this video: ${videoData?.title}\n\n${shareUrl}`,
        url: shareUrl,
        title: videoData?.title,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Shared!', 'Video shared successfully.');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleContactCreator = () => {
    setShowLeadForm(true);
  };

  const handleLeadCaptured = async (leadId: string) => {
    try {
      // Record that this video generated a lead
      await AnalyticsService.recordEngagement(videoId as string, 'comment');
      
      Alert.alert(
        'Message Sent!',
        `Your message has been sent to ${videoData?.creatorName}. They'll get back to you soon!`
      );
    } catch (error) {
      console.error('Error handling lead capture:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWatchProgress = (): number => {
    if (!videoData) return 0;
    return Math.min((watchTime / videoData.duration) * 100, 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!videoData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Video Not Found</Text>
          <Text style={styles.errorText}>
            This video may have been removed or the link is invalid.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getWatchProgress()}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatDuration(watchTime)} / {formatDuration(videoData.duration)}
            </Text>
          </View>
        </View>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{videoData.title}</Text>
          <Text style={styles.creatorName}>by {videoData.creatorName}</Text>
          
          {videoData.description && (
            <Text style={styles.videoDescription}>{videoData.description}</Text>
          )}

          <Text style={styles.videoDate}>
            Published {new Date(videoData.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLikeVideo}>
            <LinearGradient
              colors={['#dc3545', '#c82333']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>❤️ Like</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShareVideo}>
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>📤 Share</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleContactCreator}>
            <LinearGradient
              colors={['#28a745', '#20c997']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>📧 Contact</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Call-to-Action Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#f8f9fa', '#e9ecef']}
            style={styles.ctaContainer}
          >
            <Text style={styles.ctaTitle}>Interested in working with {videoData.creatorName}?</Text>
            <Text style={styles.ctaDescription}>
              Get in touch to discuss your project, ask questions, or learn more about their services.
            </Text>
            
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleContactCreator}
            >
              <LinearGradient
                colors={['#28a745', '#20c997']}
                style={styles.ctaButtonGradient}
              >
                <Text style={styles.ctaButtonText}>Send a Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Creator Info */}
        <View style={styles.creatorSection}>
          <Text style={styles.creatorSectionTitle}>About the Creator</Text>
          <View style={styles.creatorCard}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitials}>
                {videoData.creatorName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.creatorDetails}>
              <Text style={styles.creatorCardName}>{videoData.creatorName}</Text>
              <Text style={styles.creatorBio}>
                Professional AI avatar creator helping businesses scale their video content.
              </Text>
              <TouchableOpacity 
                style={styles.contactCreatorButton}
                onPress={handleContactCreator}
              >
                <Text style={styles.contactCreatorButtonText}>Get in Touch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Lead Capture Form */}
      <LeadCaptureForm
        visible={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        onLeadCaptured={handleLeadCaptured}
        source="video"
        videoId={videoId as string}
        title={`Contact ${videoData.creatorName}`}
        subtitle="Send a message about this video or discuss working together"
        prefilledData={{
          message: `Hi ${videoData.creatorName}, I watched your video "${videoData.title}" and would like to connect.`,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    backgroundColor: '#000',
  },
  video: {
    width: width,
    height: width * (9/16), // 16:9 aspect ratio
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  videoInfo: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginBottom: 12,
  },
  videoDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  videoDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaContainer: {
    padding: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 150,
  },
  ctaButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  creatorSection: {
    padding: 20,
  },
  creatorSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  creatorCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  creatorInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  creatorBio: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactCreatorButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  contactCreatorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});