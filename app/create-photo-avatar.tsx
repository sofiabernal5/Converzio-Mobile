// app/create-photo-avatar.tsx (Fixed with expo-audio ONLY)
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
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';
import Constants from 'expo-constants';
import { API_BASE_URL } from './config/api';

const { HEYGEN_API_KEY, HEYGEN_API_URL } = Constants.expoConfig?.extra || {};

interface CreationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function CreatePhotoAvatarScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [createdAvatar, setCreatedAvatar] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  // Using expo-audio hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  const audioPlayer = useAudioPlayer(audioRecorder.uri || '');

  useEffect(() => {
    getCurrentUser();
    requestAudioPermission();
  }, []);

  // Update recording duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (audioRecorder.isRecording && recordingStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [audioRecorder.isRecording, recordingStartTime]);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      } else {
        Alert.alert('Error', 'No user session found. Please log in again.');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      router.replace('/login');
    }
  };

  const requestAudioPermission = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access to record your voice.');
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      setHasPermission(false);
    }
  };

  const steps: CreationStep[] = [
    {
      id: 1,
      title: 'Upload Photo',
      description: 'Choose a clear, front-facing photo of yourself',
      completed: !!selectedImage,
    },
    {
      id: 2,
      title: 'Record Voice',
      description: 'Record a sample of your voice for cloning',
      completed: !!audioRecorder.uri,
    },
    {
      id: 3,
      title: 'Avatar Settings',
      description: 'Configure your avatar name and settings',
      completed: !!avatarName,
    },
    {
      id: 4,
      title: 'Create Avatar',
      description: 'Generate your AI avatar',
      completed: !!createdAvatar,
    },
  ];

  const pickImage = async () => {
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
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow microphone access first.');
      await requestAudioPermission();
      return;
    }

    try {
      console.log('Preparing to record...');
      await audioRecorder.prepareToRecordAsync();
      
      console.log('Starting recording...');
      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setRecordingDuration(0);
      audioRecorder.record();
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping recording...');
      await audioRecorder.stop();
      setRecordingStartTime(null);
      console.log('Recording stopped. URI:', audioRecorder.uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const playRecording = () => {
    if (!audioRecorder.uri) {
      Alert.alert('Error', 'No recording to play');
      return;
    }

    try {
      if (audioPlayer.playing) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop any playback
              if (audioPlayer.playing) {
                audioPlayer.pause();
              }
              // Reset the recorder (this will clear the URI)
              await audioRecorder.prepareToRecordAsync();
              setRecordingDuration(0);
            } catch (error) {
              console.error('Error deleting recording:', error);
            }
          }
        }
      ]
    );
  };

  const saveAvatarToDatabase = async (avatarData: any) => {
    if (!currentUserId) {
      console.error('No current user ID');
      return;
    }

    try {
      // Convert image to base64 for storage
      let imageBase64 = null;
      if (selectedImage) {
        imageBase64 = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Convert audio to base64 for storage
      let audioBase64 = null;
      if (audioRecorder.uri) {
        audioBase64 = await FileSystem.readAsStringAsync(audioRecorder.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/photo-avatars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          avatarName: avatarName,
          imageData: imageBase64,
          audioData: audioBase64,
          heygenAvatarId: avatarData.id || null,
          status: 'created'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Avatar saved to database:', data.avatarId);
        return data.avatarId;
      } else {
        throw new Error(data.message || 'Failed to save avatar');
      }
    } catch (error) {
      console.error('Error saving avatar to database:', error);
      // Don't throw here - avatar creation should continue even if DB save fails
      Alert.alert('Warning', 'Avatar created but failed to save to database.');
    }
  };

  const createAvatarWithHeyGen = async () => {
    if (!selectedImage || !avatarName || !audioRecorder.uri) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    if (!HEYGEN_API_KEY || !HEYGEN_API_URL) {
      Alert.alert('Configuration Error', 'HeyGen API credentials not configured.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Convert image and audio to base64
      const imageBase64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const audioBase64 = await FileSystem.readAsStringAsync(audioRecorder.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 2: Create avatar with HeyGen API
      console.log('Creating avatar with HeyGen API...');
      
      const avatarResponse = await fetch(`${HEYGEN_API_URL}/v1/avatar/instant`, {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_name: avatarName,
          gender: 'auto', // Let HeyGen detect
          avatar_image: `data:image/jpeg;base64,${imageBase64}`,
          voice_sample: `data:audio/wav;base64,${audioBase64}`,
          // Optional: voice settings
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      const avatarData = await avatarResponse.json();
      console.log('HeyGen Avatar Response:', avatarData);

      if (!avatarResponse.ok) {
        throw new Error(avatarData.message || `HeyGen API Error: ${avatarResponse.status}`);
      }

      // Step 3: Save to database with HeyGen avatar ID
      const dbAvatarId = await saveAvatarToDatabase({
        id: avatarData.data.avatar_id,
        name: avatarName,
        type: 'photo',
        status: avatarData.data.status || 'processing',
        voice: 'Custom Voice',
        createdAt: new Date(),
        image: selectedImage,
        audioSample: audioRecorder.uri,
      });

      // Step 4: Update state
      setCreatedAvatar({
        id: avatarData.data.avatar_id,
        name: avatarName,
        type: 'photo',
        status: avatarData.data.status,
        heygenId: avatarData.data.avatar_id,
        dbId: dbAvatarId,
        createdAt: new Date(),
      });

      setCurrentStep(4);
      
      Alert.alert(
        'Success!',
        `Your photo avatar "${avatarName}" has been submitted to HeyGen for processing. You'll be notified when it's ready!`,
        [
          {
            text: 'View Avatar',
            onPress: () => router.replace('/home')
          }
        ]
      );

    } catch (error: any) {
      console.error('HeyGen Avatar creation error:', error);
      
      // Handle specific HeyGen error codes
      if (error.message.includes('insufficient credits')) {
        Alert.alert(
          'Insufficient Credits',
          'You don\'t have enough HeyGen credits to create an avatar. Please check your HeyGen account.',
        );
      } else if (error.message.includes('invalid image')) {
        Alert.alert(
          'Invalid Image',
          'The uploaded image doesn\'t meet HeyGen\'s requirements. Please try a different photo.',
        );
      } else if (error.message.includes('invalid audio')) {
        Alert.alert(
          'Invalid Audio',
          'The recorded audio doesn\'t meet HeyGen\'s requirements. Please try recording again.',
        );
      } else {
        Alert.alert(
          'Creation Failed',
          error.message || 'Failed to create avatar with HeyGen. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Additional function to check avatar status
  const checkAvatarStatus = async (heygenAvatarId: string) => {
    try {
      const response = await fetch(`${HEYGEN_API_URL}/v1/avatar/${heygenAvatarId}`, {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          status: data.data.status,
          preview_video: data.data.preview_video,
          avatar_url: data.data.avatar_url,
        };
      } else {
        throw new Error(data.message || 'Failed to check avatar status');
      }
    } catch (error) {
      console.error('Error checking avatar status:', error);
      return null;
    }
  };

  // Function to generate a test video with the created avatar
  const generateTestVideo = async (heygenAvatarId: string, testText: string | null = null) => {
    try {
      const response = await fetch(`${HEYGEN_API_URL}/v2/video/generate`, {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: heygenAvatarId,
                avatar_style: 'normal'
              },
              voice: {
                type: 'text',
                input_text: testText || `Hello! I'm ${avatarName}, your new AI avatar created from your photo and voice. Thanks for bringing me to life!`,
                voice_id: heygenAvatarId, // Use the same avatar's voice
                speed: 1.0
              }
            }
          ],
          dimension: {
            width: 1280,
            height: 720
          },
          aspect_ratio: '16:9'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          video_id: data.data.video_id,
          status: 'processing'
        };
      } else {
        throw new Error(data.message || 'Failed to generate test video');
      }
    } catch (error) {
      console.error('Error generating test video:', error);
      return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step.id && styles.stepCircleActive,
            step.completed && styles.stepCircleCompleted,
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step.id && styles.stepNumberActive,
            ]}>
              {step.completed ? '✓' : step.id}
            </Text>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          {index < steps.length - 1 && <View style={styles.stepConnector} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Upload a clear, front-facing photo of yourself. Make sure you're looking directly at the camera with good lighting.
      </Text>
      
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>📷</Text>
            <Text style={styles.imagePlaceholderText}>Tap to select photo</Text>
            <Text style={styles.imagePlaceholderSubtext}>
              Choose a clear, front-facing photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.photoTips}>
        <Text style={styles.tipsTitle}>Photo Tips:</Text>
        <Text style={styles.tipText}>• Face the camera directly</Text>
        <Text style={styles.tipText}>• Use good lighting</Text>
        <Text style={styles.tipText}>• Keep background simple</Text>
        <Text style={styles.tipText}>• Avoid sunglasses or hats</Text>
      </View>

      {selectedImage && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(2)}
        >
          <LinearGradient
            colors={['#4a90e2', '#357abd']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Record a sample of your voice speaking naturally. This will be used to clone your voice for the avatar.
      </Text>

      {!audioRecorder.uri ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingVisual}>
            <View style={[styles.recordingCircle, audioRecorder.isRecording && styles.recordingActive]}>
              <Text style={styles.recordingIcon}>🎤</Text>
            </View>
            {audioRecorder.isRecording && (
              <Text style={styles.recordingTimer}>
                {formatDuration(recordingDuration)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.recordButton, audioRecorder.isRecording && styles.recordingButton]}
            onPress={audioRecorder.isRecording ? stopRecording : startRecording}
            disabled={!hasPermission}
          >
            <LinearGradient
              colors={audioRecorder.isRecording ? ['#dc3545', '#c82333'] : ['#28a745', '#20c997']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {audioRecorder.isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!hasPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestAudioPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Microphone Permission</Text>
            </TouchableOpacity>
          )}

          <View style={styles.recordingTips}>
            <Text style={styles.tipsTitle}>Recording Tips:</Text>
            <Text style={styles.tipText}>• Speak for 30-60 seconds</Text>
            <Text style={styles.tipText}>• Use a quiet environment</Text>
            <Text style={styles.tipText}>• Speak naturally and clearly</Text>
            <Text style={styles.tipText}>• Hold device close to your mouth</Text>
          </View>
        </View>
      ) : (
        <View style={styles.audioPreviewContainer}>
          <View style={styles.audioPreview}>
            <Text style={styles.audioPreviewTitle}>Voice Sample Recorded ✅</Text>
            <Text style={styles.audioPreviewDuration}>
              Duration: {formatDuration(recordingDuration)}
            </Text>
            
            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={playRecording}
              >
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {audioPlayer.playing ? '⏸️ Pause' : '▶️ Play'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.audioButton}
                onPress={deleteRecording}
              >
                <LinearGradient
                  colors={['#6c757d', '#5a6268']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>🔄 Re-record</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {audioRecorder.uri && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(3)}
          >
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Configure your avatar settings to personalize your AI creation.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Avatar Name *</Text>
        <TextInput
          style={styles.textInput}
          value={avatarName}
          onChangeText={setAvatarName}
          placeholder="Enter your avatar's name"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>📋 Summary:</Text>
        <Text style={styles.summaryText}>• Photo: Ready ✅</Text>
        <Text style={styles.summaryText}>• Voice: Custom recording ✅</Text>
        <Text style={styles.summaryText}>• Name: {avatarName || 'Not set ⏳'}</Text>
        <Text style={styles.summaryText}>• Duration: {formatDuration(recordingDuration)}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {avatarName && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(4)}
          >
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Ready to create your AI photo avatar! This will use your photo and voice recording to generate a digital version of yourself.
      </Text>

      {!createdAvatar ? (
        <View style={styles.createSection}>
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.disabledButton]}
            onPress={createAvatarWithHeyGen}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#cccccc', '#999999'] : ['#28a745', '#20c997']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>Creating...</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>🚀 Create My Avatar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.processingNote}>
            ⏱️ This process may take a few minutes. We'll process your photo and voice sample to create your avatar!
          </Text>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Avatar Created!</Text>
          <Text style={styles.successDescription}>
            Your photo avatar "{createdAvatar.name}" has been submitted to HeyGen for processing. 
            {createdAvatar.status === 'processing' ? 
              ' This usually takes 5-10 minutes. You\'ll be notified when it\'s ready!' :
              ' Your avatar is ready to use!'
            }
          </Text>
          
          {createdAvatar.status === 'completed' && (
            <TouchableOpacity
              style={styles.testVideoButton}
              onPress={() => generateTestVideo(createdAvatar.heygenId)}
            >
              <LinearGradient
                colors={['#28a745', '#20c997']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🎬 Generate Test Video</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {createdAvatar.status === 'processing' && (
            <TouchableOpacity
              style={styles.checkStatusButton}
              onPress={() => checkAvatarStatus(createdAvatar.heygenId)}
            >
              <LinearGradient
                colors={['#6c757d', '#5a6268']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🔄 Check Status</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.viewAvatarButton}
            onPress={() => router.replace('/home')}
          >
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>👀 View My Avatars</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {!createdAvatar && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(3)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerBackButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.headerBackText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Create Photo Avatar</Text>
          <Text style={styles.headerSubtitle}>
            Transform your photo into an AI-powered digital avatar
          </Text>
        </View>

        {renderStepIndicator()}

        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
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
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerBackButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  headerBackText: {
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
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#4a90e2',
  },
  stepCircleCompleted: {
    backgroundColor: '#28a745',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '75%',
    width: '50%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.9,
  },
  imagePickerButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedImage: {
    width: 196,
    height: 196,
    borderRadius: 98,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  photoTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  inputContainer: {
    width: '100%',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 16,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createSection: {
    alignItems: 'center',
    width: '100%',
  },
  createButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  processingNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  viewAvatarButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  testVideoButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  checkStatusButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  // Audio recording styles
  recordingContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  recordingVisual: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingActive: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderColor: '#dc3545',
  },
  recordingIcon: {
    fontSize: 32,
  },
  recordingTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recordButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  recordingButton: {
    // Additional styles for recording state
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordingTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  audioPreviewContainer: {
    width: '100%',
    marginBottom: 24,
  },
  audioPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  audioPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  audioPreviewDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
  },
  audioButton: {
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 100,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
});