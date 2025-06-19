// app/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role?: string;
  logo?: string;
  photo?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  userType?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [profileData, setProfileData] = useState({
    role: '',
    logo: '',
    photo: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    linkedin: '',
    website: '',
  });

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadUserProfile();
    }
  }, [currentUserId]);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Current user from storage:', user);
        setCurrentUserId(user.id);
      } else {
        Alert.alert('Error', 'No user session found. Please log in again.');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      Alert.alert('Error', 'Failed to get user session');
      router.replace('/login');
    }
  };

  const loadUserProfile = async () => {
    if (!currentUserId) return;
    
    try {
      console.log('Loading profile for user ID:', currentUserId);
      const response = await fetch(`http://localhost:3001/api/user/${currentUserId}`);
      const data = await response.json();
      
      console.log('Profile API response:', data);
      
      if (data.success) {
        setUserProfile(data.user);
        setProfileData({
          role: data.user.role || '',
          logo: data.user.logo || '',
          photo: data.user.photo || '',
          instagram: data.user.instagram || '',
          tiktok: data.user.tiktok || '',
          facebook: data.user.facebook || '',
          linkedin: data.user.linkedin || '',
          website: data.user.website || '',
        });
      } else {
        Alert.alert('Error', 'Failed to load profile: ' + data.message);
      }
    } catch (error) {
      console.error('Profile load error:', error);
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('photo', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickLogoImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('logo', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Error', 'Failed to pick logo');
    }
  };

  const saveProfile = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'No user session found');
      return;
    }
    
    setSaving(true);
    
    try {
      console.log('Saving profile for user ID:', currentUserId);
      const response = await fetch(`http://localhost:3001/api/user/${currentUserId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        await loadUserProfile(); // Reload the profile data
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setSaving(false);
    }
  };

  const validateWebsite = (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const formatSocialMedia = (handle: string) => {
    if (!handle) return '';
    return handle.startsWith('@') ? handle : '@' + handle;
  };

  if (loading || !currentUserId) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>
            {!currentUserId ? 'Checking user session...' : 'Loading Profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Add additional information to enhance your professional presence
          </Text>
        </View>

        {/* Basic Info Display */}
        {userProfile && (
          <View style={styles.basicInfoSection}>
            <Text style={styles.sectionTitle}>Current Information</Text>
            <View style={styles.basicInfoCard}>
              <Text style={styles.basicInfoText}>
                <Text style={styles.basicInfoLabel}>Name: </Text>
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Text style={styles.basicInfoText}>
                <Text style={styles.basicInfoLabel}>Email: </Text>
                {userProfile.email}
              </Text>
              <Text style={styles.basicInfoText}>
                <Text style={styles.basicInfoLabel}>Phone: </Text>
                {userProfile.phone}
              </Text>
              <Text style={styles.basicInfoText}>
                <Text style={styles.basicInfoLabel}>Company: </Text>
                {userProfile.company}
              </Text>
            </View>
          </View>
        )}

        {/* Profile Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          {/* Profile Photo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Profile Photo</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickProfileImage}>
              {profileData.photo ? (
                <Image source={{ uri: profileData.photo }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>👤</Text>
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Role */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Professional Role</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.role}
              onChangeText={(value) => updateField('role', value)}
              placeholder="e.g. CEO, Marketing Director, Content Creator"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
            />
          </View>

          {/* Company Logo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Logo</Text>
            <TouchableOpacity style={styles.logoPickerButton} onPress={pickLogoImage}>
              {profileData.logo ? (
                <Image source={{ uri: profileData.logo }} style={styles.selectedLogo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderIcon}>🏢</Text>
                  <Text style={styles.logoPlaceholderText}>Tap to add company logo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Website */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.website}
              onChangeText={(value) => updateField('website', validateWebsite(value))}
              placeholder="https://yourwebsite.com"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Social Media Section */}
          <Text style={styles.subsectionTitle}>Social Media Profiles</Text>
          
          {/* Instagram */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instagram</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.instagram}
              onChangeText={(value) => updateField('instagram', value)}
              placeholder="@yourusername or instagram.com/yourusername"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              autoCapitalize="none"
            />
          </View>

          {/* TikTok */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TikTok</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.tiktok}
              onChangeText={(value) => updateField('tiktok', value)}
              placeholder="@yourusername or tiktok.com/@yourusername"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              autoCapitalize="none"
            />
          </View>

          {/* Facebook */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Facebook</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.facebook}
              onChangeText={(value) => updateField('facebook', value)}
              placeholder="facebook.com/yourpage"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              autoCapitalize="none"
            />
          </View>

          {/* LinkedIn */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LinkedIn</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.linkedin}
              onChangeText={(value) => updateField('linkedin', value)}
              placeholder="linkedin.com/in/yourprofile"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              autoCapitalize="none"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveProfile}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ['#cccccc', '#999999'] : ['#4a90e2', '#357abd']}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
                </>
              ) : (
                <Text style={styles.saveButtonText}>Save Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  basicInfoSection: {
    padding: 24,
    paddingTop: 0,
  },
  basicInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  basicInfoText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  basicInfoLabel: {
    fontWeight: 'bold',
  },
  formSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  imagePlaceholderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  logoPickerButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedLogo: {
    width: 96,
    height: 96,
    borderRadius: 6,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoPlaceholderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  logoPlaceholderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

});