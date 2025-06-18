// app/analytics.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AnalyticsService, { VideoAnalytics, AnalyticsSummary } from '../services/AnalyticsService';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [videoAnalytics, setVideoAnalytics] = useState<VideoAnalytics[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const summaryData = await AnalyticsService.getAnalyticsSummary();
      setSummary(summaryData);

      let analyticsData: VideoAnalytics[] = [];
      
      if (selectedPeriod === 'all') {
        analyticsData = await AnalyticsService.getAllAnalytics();
      } else {
        const daysBack = selectedPeriod === '7d' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        
        analyticsData = await AnalyticsService.getAnalyticsForDateRange(
          startDate.toISOString(),
          new Date().toISOString()
        );
      }

      setVideoAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const exportData = await AnalyticsService.exportAnalytics();
      Alert.alert(
        'Analytics Export',
        'Analytics data exported successfully!\n\nIn a real app, this would be saved to a file or shared.',
        [
          { text: 'OK' }
        ]
      );
      console.log('Exported Analytics Data:', exportData);
    } catch (error) {
      Alert.alert('Error', 'Failed to export analytics data');
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <LinearGradient
        colors={['#4a90e2', '#357abd']}
        style={styles.summaryGradient}
      >
        <Text style={styles.summaryTitle}>Analytics Overview</Text>
        {summary && (
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.totalViews}</Text>
              <Text style={styles.summaryLabel}>Total Views</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.totalVideos}</Text>
              <Text style={styles.summaryLabel}>Videos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{formatDuration(summary.averageWatchTime)}</Text>
              <Text style={styles.summaryLabel}>Avg Watch Time</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.averageEngagementRate}%</Text>
              <Text style={styles.summaryLabel}>Engagement Rate</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['7d', '30d', 'all'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTopPerformer = () => {
    if (!summary?.topPerformingVideo) return null;

    const topVideo = summary.topPerformingVideo;
    return (
      <View style={styles.topPerformerCard}>
        <Text style={styles.cardTitle}>🏆 Top Performing Video</Text>
        <View style={styles.topPerformerContent}>
          <Text style={styles.topPerformerTitle}>{topVideo.videoTitle}</Text>
          <View style={styles.topPerformerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{topVideo.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{topVideo.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{topVideo.shares}</Text>
              <Text style={styles.statLabel}>Shares</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{topVideo.engagementRate}%</Text>
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderVideoList = () => (
    <View style={styles.videoListContainer}>
      <Text style={styles.cardTitle}>📊 Video Performance</Text>
      {videoAnalytics.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Analytics Data</Text>
          <Text style={styles.emptyStateDescription}>
            Create and share videos to start tracking analytics
          </Text>
        </View>
      ) : (
        <View style={styles.videoList}>
          {videoAnalytics.map((video) => (
            <View key={video.id} style={styles.videoCard}>
              <View style={styles.videoCardHeader}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {video.videoTitle}
                </Text>
                <Text style={styles.videoDate}>
                  {formatDate(video.createdAt)}
                </Text>
              </View>
              
              <View style={styles.videoStats}>
                <View style={styles.videoStatItem}>
                  <Text style={styles.videoStatNumber}>{video.views}</Text>
                  <Text style={styles.videoStatLabel}>Views</Text>
                </View>
                <View style={styles.videoStatItem}>
                  <Text style={styles.videoStatNumber}>{formatDuration(Math.round(video.watchTime / Math.max(video.views, 1)))}</Text>
                  <Text style={styles.videoStatLabel}>Avg Watch</Text>
                </View>
                <View style={styles.videoStatItem}>
                  <Text style={styles.videoStatNumber}>{video.likes + video.shares + video.comments}</Text>
                  <Text style={styles.videoStatLabel}>Interactions</Text>
                </View>
                <View style={styles.videoStatItem}>
                  <Text style={styles.videoStatNumber}>{video.engagementRate}%</Text>
                  <Text style={styles.videoStatLabel}>Engagement</Text>
                </View>
              </View>

              {video.lastViewed && (
                <Text style={styles.lastViewed}>
                  Last viewed: {formatDate(video.lastViewed)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4a90e2', '#357abd']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Analytics</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4a90e2', '#357abd']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity onPress={exportData}>
            <Text style={styles.exportButton}>Export</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSummaryCard()}
        {renderPeriodSelector()}
        {renderTopPerformer()}
        {renderVideoList()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  exportButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
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
  summaryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4a90e2',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  topPerformerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  topPerformerContent: {
    marginTop: 8,
  },
  topPerformerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topPerformerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  videoListContainer: {
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
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  videoList: {
    gap: 16,
  },
  videoCard: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
  },
  videoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  videoDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  videoStatItem: {
    alignItems: 'center',
  },
  videoStatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  videoStatLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  lastViewed: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});