// app/create-video-avatar.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import AnimatedBackground from '../components/AnimatedBackground';

interface CreationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function CreateVideoAvatarScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoScript, setVideoScript] = useState('');
  const [createdAvatar, setCreatedAvatar] = useState<any>(null);

  const steps: CreationStep[] = [
    {
      id: 1,
      title: 'Record/Upload Video',
      description: 'Provide a 2-5 minute video of yourself speaking',
      completed: !!selectedVideo,
    },
    {
      id: 2,
      title: 'Avatar Settings',
      description: 'Configure your avatar name and settings',
      completed: !!avatarName && !!videoScript,
    },
    {
      id: 3,
      title: 'Create Avatar',
      description: 'Generate your high-fidelity video avatar',
      completed: !!createdAvatar,
    },
  ];

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your media library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };

  const recordVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow camera access to record video.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  };

  const createVideoAvatar = async () => {
    if (!selectedVideo || !avatarName) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate video avatar creation process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newAvatar = {
        id: `video_avatar_${Date.now()}`,
        name: avatarName,
        type: 'video',
        status: 'Processing',
        script: videoScript,
        createdAt: new Date(),
        video: selectedVideo,
      };

      setCreatedAvatar(newAvatar);
      setCurrentStep(3);
      
      Alert.alert(
        'Success!',
        'Your video avatar creation has been initiated! Processing may take 15-30 minutes.',
        [
          {
            text: 'View Dashboard',
            onPress: () => router.replace('/home')
          }
        ]
      );
    } catch (error: any) {
      console.error('Video avatar creation error:', error);
      Alert.alert(
        'Creation Failed',
        'Failed to create video avatar. Please try again.',
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

  const renderStep1 = () => {
    const player = selectedVideo ? useVideoPlayer(selectedVideo, player => {
      player.loop = false;
      player.play();
    }) : null;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>
          Record or upload a 2-5 minute video of yourself speaking naturally. This will be used to create your high-fidelity avatar.
        </Text>
        
        {selectedVideo ? (
          <View style={styles.videoContainer}>
            {player && (
              <VideoView
                style={styles.videoPreview}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
              />
            )}
            <TouchableOpacity
              style={styles.changeVideoButton}
              onPress={() => setSelectedVideo(null)}
            >
              <Text style={styles.changeVideoText}>Change Video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderIcon}>VIDEO</Text>
            <Text style={styles.videoPlaceholderText}>No video selected</Text>
            
            <View style={styles.videoButtonsContainer}>
              <TouchableOpacity
                style={styles.videoButton}
                onPress={recordVideo}
              >
                <LinearGradient
                  colors={['#28a745', '#20c997']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Record Video</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.videoButton}
                onPress={pickVideo}
              >
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Upload Video</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.videoTips}>
          <Text style={styles.tipsTitle}>Video Requirements:</Text>
          <Text style={styles.tipText}>• 2-5 minutes duration</Text>
          <Text style={styles.tipText}>• Good lighting and audio quality</Text>
          <Text style={styles.tipText}>• Face the camera directly</Text>
          <Text style={styles.tipText}>• Speak naturally and clearly</Text>
          <Text style={styles.tipText}>• Minimal background movement</Text>
        </View>

        {selectedVideo && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(2)}
          >
            <LinearGradient
              colors={['#28a745', '#20c997']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Configure your video avatar settings to personalize your AI creation.
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Sample Script *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={videoScript}
          onChangeText={setVideoScript}
          placeholder="Enter what you said in the video (this helps train the avatar)"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          multiline
          numberOfLines={4}
        />
        <Text style={styles.inputHelpText}>
          Providing the script from your video helps create a more accurate avatar
        </Text>
      </View>

      <View style={styles.processingInfo}>
        <Text style={styles.processingTitle}>Processing Time</Text>
        <Text style={styles.processingText}>
          Video avatars take 15-30 minutes to process due to the advanced AI technology required for high-quality results.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {avatarName && videoScript && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(3)}
          >
            <LinearGradient
              colors={['#28a745', '#20c997']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Ready to create your high-fidelity video avatar! This will process your video to create a realistic digital version of yourself.
      </Text>

      {!createdAvatar ? (
        <View style={styles.createSection}>
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.disabledButton]}
            onPress={createVideoAvatar}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#cccccc', '#999999'] : ['#28a745', '#20c997']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.loadingText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Create My Video Avatar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.processingNote}>
            This process will take 15-30 minutes. You'll receive a notification when your avatar is ready!
          </Text>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>PROCESSING</Text>
          <Text style={styles.successTitle}>Avatar Creation Started!</Text>
          <Text style={styles.successDescription}>
            Your video avatar "{createdAvatar.name}" is being processed. This typically takes 15-30 minutes for the best quality results.
          </Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Current Status:</Text>
            <Text style={styles.statusText}>Processing video...</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.viewAvatarButton}
            onPress={() => router.replace('/home')}
          >
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Go to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {!createdAvatar && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={styles.backButtonText}>Back</Text>
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
          
          <Text style={styles.headerTitle}>Create Video Avatar</Text>
          <Text style={styles.headerSubtitle}>
            Create a high-fidelity avatar from your video footage
          </Text>
        </View>

        {renderStepIndicator()}

        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
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
    backgroundColor: '#28a745',
  },
  stepCircleCompleted: {
    backgroundColor: '#20c997',
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
  videoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  changeVideoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 12,
  },
  changeVideoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  videoPlaceholder: {
    alignItems: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  videoPlaceholderIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
    letterSpacing: 1,
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
  },
  videoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  videoButton: {
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 120,
  },
  videoTips: {
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputHelpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  processingInfo: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
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
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
    letterSpacing: 2,
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
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '30%',
    backgroundColor: '#28a745',
    borderRadius: 2,
  },
  viewAvatarButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
});