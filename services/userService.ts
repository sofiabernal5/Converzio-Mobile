// services/userService.ts
import API from './api';
import { User } from './auth';

export interface UserProfile extends User {
  bio?: string;
  company?: string;
  website?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Avatar {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'failed';
  imageUrl?: string;
  voiceId?: string;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  avatarId: string;
  duration?: number;
  createdAt: string;
}

export const userService = {
  // Profile Management
  async getProfile(): Promise<UserProfile> {
    const response = await API.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await API.put('/user/profile', data);
    return response.data;
  },

  async uploadAvatar(imageUri: string): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await API.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Avatar Management
  async getAvatars(): Promise<Avatar[]> {
    const response = await API.get('/user/avatars');
    return response.data;
  },

  async createAvatar(data: {
    name: string;
    imageUri: string;
    voiceDescription?: string;
  }): Promise<Avatar> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('image', {
      uri: data.imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    
    if (data.voiceDescription) {
      formData.append('voiceDescription', data.voiceDescription);
    }

    const response = await API.post('/user/avatars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async deleteAvatar(avatarId: string): Promise<void> {
    await API.delete(`/user/avatars/${avatarId}`);
  },

  // Video Management
  async getVideos(): Promise<Video[]> {
    const response = await API.get('/user/videos');
    return response.data;
  },

  async createVideo(data: {
    title: string;
    script: string;
    avatarId: string;
  }): Promise<Video> {
    const response = await API.post('/user/videos', data);
    return response.data;
  },

  async deleteVideo(videoId: string): Promise<void> {
    await API.delete(`/user/videos/${videoId}`);
  },

  // Analytics
  async getAnalytics(): Promise<{
    totalVideos: number;
    totalViews: number;
    totalAvatars: number;
    recentActivity: Array<{
      id: string;
      type: 'video_created' | 'avatar_created' | 'profile_updated';
      message: string;
      createdAt: string;
    }>;
  }> {
    const response = await API.get('/user/analytics');
    return response.data;
  },
};