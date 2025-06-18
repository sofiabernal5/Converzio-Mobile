// services/AnalyticsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoAnalytics {
  id: string;
  videoId: string;
  videoTitle: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  watchTime: number; // in seconds
  createdAt: string;
  lastViewed: string;
  viewHistory: ViewEvent[];
  engagementRate: number;
}

export interface ViewEvent {
  timestamp: string;
  duration: number; // how long they watched in seconds
  completed: boolean; // did they watch to the end
  source: 'direct' | 'share' | 'preview'; // how they accessed it
}

export interface AnalyticsSummary {
  totalViews: number;
  totalVideos: number;
  averageWatchTime: number;
  topPerformingVideo: VideoAnalytics | null;
  totalEngagementActions: number;
  averageEngagementRate: number;
}

class AnalyticsService {
  private static readonly ANALYTICS_KEY = 'converzio_analytics';
  private static readonly SUMMARY_KEY = 'converzio_analytics_summary';

  // Get all analytics data
  static async getAllAnalytics(): Promise<VideoAnalytics[]> {
    try {
      const data = await AsyncStorage.getItem(this.ANALYTICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading analytics:', error);
      return [];
    }
  }

  // Get analytics for a specific video
  static async getVideoAnalytics(videoId: string): Promise<VideoAnalytics | null> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      return allAnalytics.find(analytics => analytics.videoId === videoId) || null;
    } catch (error) {
      console.error('Error loading video analytics:', error);
      return null;
    }
  }

  // Create analytics entry for new video
  static async createVideoAnalytics(videoId: string, videoTitle: string): Promise<VideoAnalytics> {
    const analytics: VideoAnalytics = {
      id: `analytics_${Date.now()}`,
      videoId,
      videoTitle,
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      watchTime: 0,
      createdAt: new Date().toISOString(),
      lastViewed: '',
      viewHistory: [],
      engagementRate: 0,
    };

    await this.saveVideoAnalytics(analytics);
    return analytics;
  }

  // Record a video view
  static async recordView(
    videoId: string, 
    duration: number, 
    completed: boolean = false,
    source: 'direct' | 'share' | 'preview' = 'direct'
  ): Promise<void> {
    try {
      const analytics = await this.getVideoAnalytics(videoId);
      if (!analytics) return;

      const viewEvent: ViewEvent = {
        timestamp: new Date().toISOString(),
        duration,
        completed,
        source,
      };

      analytics.views += 1;
      analytics.watchTime += duration;
      analytics.lastViewed = new Date().toISOString();
      analytics.viewHistory.push(viewEvent);
      analytics.engagementRate = this.calculateEngagementRate(analytics);

      await this.saveVideoAnalytics(analytics);
      await this.updateSummary();
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }

  // Record engagement actions (likes, shares, comments)
  static async recordEngagement(
    videoId: string, 
    type: 'like' | 'share' | 'comment'
  ): Promise<void> {
    try {
      const analytics = await this.getVideoAnalytics(videoId);
      if (!analytics) return;

      switch (type) {
        case 'like':
          analytics.likes += 1;
          break;
        case 'share':
          analytics.shares += 1;
          break;
        case 'comment':
          analytics.comments += 1;
          break;
      }

      analytics.engagementRate = this.calculateEngagementRate(analytics);
      await this.saveVideoAnalytics(analytics);
      await this.updateSummary();
    } catch (error) {
      console.error('Error recording engagement:', error);
    }
  }

  // Calculate engagement rate
  private static calculateEngagementRate(analytics: VideoAnalytics): number {
    if (analytics.views === 0) return 0;
    const totalEngagements = analytics.likes + analytics.shares + analytics.comments;
    return Math.round((totalEngagements / analytics.views) * 100);
  }

  // Save analytics data
  private static async saveVideoAnalytics(analytics: VideoAnalytics): Promise<void> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      const index = allAnalytics.findIndex(a => a.videoId === analytics.videoId);
      
      if (index >= 0) {
        allAnalytics[index] = analytics;
      } else {
        allAnalytics.push(analytics);
      }

      await AsyncStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(allAnalytics));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  // Get analytics summary
  static async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      
      const totalViews = allAnalytics.reduce((sum, a) => sum + a.views, 0);
      const totalVideos = allAnalytics.length;
      const totalWatchTime = allAnalytics.reduce((sum, a) => sum + a.watchTime, 0);
      const averageWatchTime = totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0;
      
      const topPerformingVideo = allAnalytics.length > 0 
        ? allAnalytics.reduce((top, current) => 
            current.views > top.views ? current : top
          )
        : null;

      const totalEngagementActions = allAnalytics.reduce(
        (sum, a) => sum + a.likes + a.shares + a.comments, 0
      );

      const averageEngagementRate = totalVideos > 0
        ? Math.round(allAnalytics.reduce((sum, a) => sum + a.engagementRate, 0) / totalVideos)
        : 0;

      return {
        totalViews,
        totalVideos,
        averageWatchTime,
        topPerformingVideo,
        totalEngagementActions,
        averageEngagementRate,
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        totalViews: 0,
        totalVideos: 0,
        averageWatchTime: 0,
        topPerformingVideo: null,
        totalEngagementActions: 0,
        averageEngagementRate: 0,
      };
    }
  }

  // Update summary cache
  private static async updateSummary(): Promise<void> {
    try {
      const summary = await this.getAnalyticsSummary();
      await AsyncStorage.setItem(this.SUMMARY_KEY, JSON.stringify(summary));
    } catch (error) {
      console.error('Error updating summary:', error);
    }
  }

  // Delete analytics for a video
  static async deleteVideoAnalytics(videoId: string): Promise<void> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      const filteredAnalytics = allAnalytics.filter(a => a.videoId !== videoId);
      await AsyncStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(filteredAnalytics));
      await this.updateSummary();
    } catch (error) {
      console.error('Error deleting analytics:', error);
    }
  }

  // Get analytics for date range
  static async getAnalyticsForDateRange(startDate: string, endDate: string): Promise<VideoAnalytics[]> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      return allAnalytics.filter(analytics => {
        const createdDate = new Date(analytics.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return createdDate >= start && createdDate <= end;
      });
    } catch (error) {
      console.error('Error getting analytics for date range:', error);
      return [];
    }
  }

  // Export analytics data
  static async exportAnalytics(): Promise<string> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      const summary = await this.getAnalyticsSummary();
      
      return JSON.stringify({
        summary,
        videoAnalytics: allAnalytics,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return '';
    }
  }
}

export default AnalyticsService;