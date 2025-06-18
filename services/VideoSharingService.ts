// services/VideoSharingService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SharedVideo {
  id: string;
  videoId: string;
  title: string;
  creatorName: string;
  creatorEmail: string;
  shareUrl: string;
  qrCodeUrl: string;
  isPublic: boolean;
  password?: string;
  expiresAt?: string;
  createdAt: string;
  viewCount: number;
  leadCount: number;
}

export interface VideoShareOptions {
  isPublic: boolean;
  requirePassword?: boolean;
  password?: string;
  expirationDays?: number;
  customMessage?: string;
}

class VideoSharingService {
  private static readonly SHARED_VIDEOS_KEY = 'converzio_shared_videos';
  private static readonly BASE_URL = 'https://converzio.app';

  // Generate shareable link for a video
  static async shareVideo(
    videoId: string,
    title: string,
    creatorName: string,
    creatorEmail: string,
    options: VideoShareOptions = { isPublic: true }
  ): Promise<SharedVideo> {
    try {
      const shareId = this.generateShareId();
      const shareUrl = `${this.BASE_URL}/watch/${shareId}`;
      const qrCodeUrl = await this.generateQRCode(shareUrl);
      
      const expiresAt = options.expirationDays 
        ? new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const sharedVideo: SharedVideo = {
        id: shareId,
        videoId,
        title,
        creatorName,
        creatorEmail,
        shareUrl,
        qrCodeUrl,
        isPublic: options.isPublic,
        password: options.password,
        expiresAt,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        leadCount: 0,
      };

      await this.saveSharedVideo(sharedVideo);
      return sharedVideo;
    } catch (error) {
      console.error('Error sharing video:', error);
      throw error;
    }
  }

  // Get shared video by share ID
  static async getSharedVideo(shareId: string): Promise<SharedVideo | null> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const sharedVideo = sharedVideos.find(video => video.id === shareId);
      
      if (!sharedVideo) return null;
      
      // Check if expired
      if (sharedVideo.expiresAt && new Date() > new Date(sharedVideo.expiresAt)) {
        return null;
      }
      
      return sharedVideo;
    } catch (error) {
      console.error('Error getting shared video:', error);
      return null;
    }
  }

  // Get all shared videos for current user
  static async getAllSharedVideos(): Promise<SharedVideo[]> {
    try {
      const data = await AsyncStorage.getItem(this.SHARED_VIDEOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading shared videos:', error);
      return [];
    }
  }

  // Update view count when video is watched
  static async recordView(shareId: string): Promise<void> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const index = sharedVideos.findIndex(video => video.id === shareId);
      
      if (index >= 0) {
        sharedVideos[index].viewCount += 1;
        await AsyncStorage.setItem(this.SHARED_VIDEOS_KEY, JSON.stringify(sharedVideos));
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }

  // Update lead count when someone submits contact form
  static async recordLead(shareId: string): Promise<void> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const index = sharedVideos.findIndex(video => video.id === shareId);
      
      if (index >= 0) {
        sharedVideos[index].leadCount += 1;
        await AsyncStorage.setItem(this.SHARED_VIDEOS_KEY, JSON.stringify(sharedVideos));
      }
    } catch (error) {
      console.error('Error recording lead:', error);
    }
  }

  // Update shared video settings
  static async updateSharedVideo(shareId: string, updates: Partial<SharedVideo>): Promise<boolean> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const index = sharedVideos.findIndex(video => video.id === shareId);
      
      if (index >= 0) {
        sharedVideos[index] = { ...sharedVideos[index], ...updates };
        await AsyncStorage.setItem(this.SHARED_VIDEOS_KEY, JSON.stringify(sharedVideos));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating shared video:', error);
      return false;
    }
  }

  // Delete shared video
  static async deleteSharedVideo(shareId: string): Promise<boolean> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const filteredVideos = sharedVideos.filter(video => video.id !== shareId);
      await AsyncStorage.setItem(this.SHARED_VIDEOS_KEY, JSON.stringify(filteredVideos));
      return true;
    } catch (error) {
      console.error('Error deleting shared video:', error);
      return false;
    }
  }

  // Generate sharing analytics
  static async getShareAnalytics(videoId?: string): Promise<{
    totalShares: number;
    totalViews: number;
    totalLeads: number;
    conversionRate: number;
    topPerformingShares: SharedVideo[];
  }> {
    try {
      let sharedVideos = await this.getAllSharedVideos();
      
      if (videoId) {
        sharedVideos = sharedVideos.filter(video => video.videoId === videoId);
      }

      const totalShares = sharedVideos.length;
      const totalViews = sharedVideos.reduce((sum, video) => sum + video.viewCount, 0);
      const totalLeads = sharedVideos.reduce((sum, video) => sum + video.leadCount, 0);
      const conversionRate = totalViews > 0 ? Math.round((totalLeads / totalViews) * 100) : 0;
      
      const topPerformingShares = sharedVideos
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);

      return {
        totalShares,
        totalViews,
        totalLeads,
        conversionRate,
        topPerformingShares,
      };
    } catch (error) {
      console.error('Error getting share analytics:', error);
      return {
        totalShares: 0,
        totalViews: 0,
        totalLeads: 0,
        conversionRate: 0,
        topPerformingShares: [],
      };
    }
  }

  // Validate access to shared video
  static async validateAccess(shareId: string, password?: string): Promise<boolean> {
    try {
      const sharedVideo = await this.getSharedVideo(shareId);
      
      if (!sharedVideo) return false;
      
      // Check if public
      if (sharedVideo.isPublic) return true;
      
      // Check password if required
      if (sharedVideo.password) {
        return password === sharedVideo.password;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating access:', error);
      return false;
    }
  }

  // Generate share templates
  static generateShareMessage(sharedVideo: SharedVideo, customMessage?: string): string {
    const baseMessage = customMessage || `Check out this video: "${sharedVideo.title}" by ${sharedVideo.creatorName}`;
    return `${baseMessage}\n\n🎥 Watch here: ${sharedVideo.shareUrl}\n\nCreated with Converzio`;
  }

  static generateEmailTemplate(sharedVideo: SharedVideo, customMessage?: string): {
    subject: string;
    body: string;
  } {
    const subject = `${sharedVideo.creatorName} shared a video with you: ${sharedVideo.title}`;
    const body = `
Hi there!

${sharedVideo.creatorName} has shared a video with you.

📹 "${sharedVideo.title}"

${customMessage || 'I thought you might find this interesting!'}

Watch the video here: ${sharedVideo.shareUrl}

If you have any questions or would like to get in touch, you can reply directly through the video page.

Best regards,
${sharedVideo.creatorName}

---
This video was created with Converzio - AI-powered professional video creation.
    `.trim();

    return { subject, body };
  }

  // Helper methods
  private static generateShareId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static async generateQRCode(url: string): Promise<string> {
    // In a real app, you'd use a QR code generation service
    // For now, we'll use a mock QR code URL
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
  }

  private static async saveSharedVideo(sharedVideo: SharedVideo): Promise<void> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      sharedVideos.push(sharedVideo);
      await AsyncStorage.setItem(this.SHARED_VIDEOS_KEY, JSON.stringify(sharedVideos));
    } catch (error) {
      console.error('Error saving shared video:', error);
      throw error;
    }
  }

  // Export shared videos data
  static async exportSharedVideos(): Promise<string> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const analytics = await this.getShareAnalytics();
      
      return JSON.stringify({
        sharedVideos,
        analytics,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Error exporting shared videos:', error);
      return '';
    }
  }

  // Cleanup expired shares
  static async cleanupExpiredShares(): Promise<number> {
    try {
      const sharedVideos = await this.getAllSharedVideos();
      const now = new Date();
      
      const activeVideos = sharedVideos.filter(video => {
        if (!video.expiresAt) return true;
        return new Date(video.expiresAt) > now;
      });

      const expiredCount = sharedVideos.length - activeVideos.length;
      
      if (expiredCount > 0) {
        await AsyncStorage.setItem(this.SHARED_VIDEOS_KEY, JSON.stringify(activeVideos));
      }
      
      return expiredCount;
    } catch (error) {
      console.error('Error cleaning up expired shares:', error);
      return 0;
    }
  }
}

export default VideoSharingService;