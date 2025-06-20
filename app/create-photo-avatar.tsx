// app/create-photo-avatar.tsx - Enhanced with script upload and database integration
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
import { API_BASE_URL } from './config/api';

interface CreationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreatePhotoAvatarScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Form data
  const [avatarName, setAvatarName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [createdAvatar, setCreatedAvatar] = useState<any>(null);

  let durationInterval: NodeJS.Timeout | null = null;

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
      completed: !!audioUri,
    },
    {
      id: 3,
      title: 'Write Script',
      description: 'Create your custom script (up to 150 words)',
      completed: !!script && script.trim().length > 0,
    },
    {
      id: 4,
      title: 'Avatar Settings',
      description: 'Configure your avatar name and settings',
      completed: !!avatarName,
    },
    {
      id: 5,
      title: 'Create Avatar',
      description: 'Generate your AI avatar',
      completed: !!createdAvatar,
    },
  ];

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setUserInfo(JSON.parse(userData));
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
    try {
      setIsRecording(true);
      
      const startTime = Date.now();
      durationInterval = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      
      if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
      }
      
      const simulatedUri = `mock_audio_${Date.now()}.m4a`;
      setAudioUri(simulatedUri);
      setRecordingDuration(0);
      
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const deleteRecording = () => {
    setAudioUri(null);
    setRecordingDuration(0);
    setIsRecording(false);
    if (durationInterval) {
      clearInterval(durationInterval);
      durationInterval = null;
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;
    
    try {
      Alert.alert('Audio Playback', 'Playing recorded audio sample...');
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleScriptChange = (text: string) => {
    const wordCount = countWords(text);
    if (wordCount <= 150) {
      setScript(text);
    } else {
      Alert.alert('Word Limit Exceeded', 'Your script cannot exceed 150 words. Please shorten your text.');
    }
  };

  const saveAvatarToDatabase = async () => {
    if (!userInfo || !selectedImage || !avatarName || !audioUri || !script) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return false;
    }

    try {
      const avatarData = {
        userId: userInfo.id,
        name: avatarName,
        photoUri: selectedImage,
        audioUri: audioUri,
        script: script.trim(),
        wordCount: countWords(script)
      };

      console.log('Saving avatar to database:', avatarData);

      const response = await fetch(`${API_BASE_URL}/api/photo-avatars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(avatarData),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Avatar saved successfully:', data);
        return data.avatar;
      } else {
        throw new Error(data.message || 'Failed to save avatar');
      }
    } catch (error: any) {
      console.error('Error saving avatar:', error);
      Alert.alert('Database Error', 'Failed to save avatar: ' + error.message);
      return false;
    }
  };

  const createAvatarWithHeyGen = async () => {
    if (!selectedImage || !avatarName || !audioUri || !script) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    
    try {
      // First save to database
      const savedAvatar = await saveAvatarToDatabase();
      if (!savedAvatar) {
        return;
      }

      // Simulate HeyGen API call (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newAvatar = {
        id: savedAvatar.id,
        name: avatarName,
        type: 'photo',
        status: 'Generated',
        voice: 'Custom Voice',
        script: script,
        wordCount: countWords(script),
        createdAt: new Date(),
        image: selectedImage,
        audioSample: audioUri,
      };

      setCreatedAvatar(newAvatar);
      setCurrentStep(5);
      
      Alert.alert(
        'Success!',
        'Your photo avatar has been created and saved successfully!',
        [
          {
            text: 'View Avatar',
            onPress: () => router.replace('/home')
          }
        ]
      );
    } catch (error: any) {
      console.error('Avatar creation error:', error);
      Alert.alert(
        'Creation Failed',
        error.message || 'Failed to create avatar. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
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

      {!audioUri ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingVisual}>
            <View style={[styles.recordingCircle, isRecording && styles.recordingActive]}>
              <Text style={styles.recordingIcon}>🎤</Text>
            </View>
            {isRecording && (
              <Text style={styles.recordingTimer}>
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <LinearGradient
              colors={isRecording ? ['#dc3545', '#c82333'] : ['#28a745', '#20c997']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

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
              Duration: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
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
                  <Text style={styles.buttonText}>▶️ Play</Text>
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

        {audioUri && (
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
        Write the script you want your avatar to speak. Keep it engaging and within 150 words for best results.
      </Text>

      <View style={styles.scriptContainer}>
        <View style={styles.scriptHeader}>
          <Text style={styles.scriptLabel}>Your Script</Text>
          <Text style={[
            styles.wordCount,
            countWords(script) > 140 && styles.wordCountWarning,
            countWords(script) >= 150 && styles.wordCountError
          ]}>
            {countWords(script)}/150 words
          </Text>
        </View>
        
        <TextInput
          style={styles.scriptInput}
          value={script}
          onChangeText={handleScriptChange}
          placeholder="Write what you want your avatar to say... For example: 'Hello! Welcome to my presentation. Today I'll be sharing insights about our latest product features and how they can benefit your business. Let's dive into the key highlights that will transform your workflow.'"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.scriptTips}>
        <Text style={styles.tipsTitle}>Script Tips:</Text>
        <Text style={styles.tipText}>• Keep it conversational and natural</Text>
        <Text style={styles.tipText}>• Use simple, clear language</Text>
        <Text style={styles.tipText}>• Stay under 150 words for best quality</Text>
        <Text style={styles.tipText}>• Include pauses with commas and periods</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {script.trim().length > 0 && (
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
        <Text style={styles.summaryText}>• Script: {countWords(script)} words ✅</Text>
        <Text style={styles.summaryText}>• Name: {avatarName || 'Not set ⏳'}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(3)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {avatarName && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(5)}
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

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Ready to create your AI photo avatar! This will use your photo, voice recording, and script to generate a digital version of yourself.
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
            ⏱️ This process may take a few minutes. We'll process your photo, voice sample, and script to create your avatar!
          </Text>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Avatar Created!</Text>
          <Text style={styles.successDescription}>
            Your photo avatar "{createdAvatar.name}" has been created successfully with your custom voice and script ({createdAvatar.wordCount} words).
          </Text>
          
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
          onPress={() => setCurrentStep(4)}
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
          {currentStep === 5 && renderStep5()}
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
    paddingHorizontal: 8,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '85%',
    width: '30%',
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
  // Script styles
  scriptContainer: {
    width: '100%',
    marginBottom: 24,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scriptLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  wordCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  wordCountWarning: {
    color: '#ffc107',
  },
  wordCountError: {
    color: '#dc3545',
  },
  scriptInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    maxHeight: 200,
  },
  scriptTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
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