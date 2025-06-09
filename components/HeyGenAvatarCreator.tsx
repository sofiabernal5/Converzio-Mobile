// components/HeyGenAvatarCreator.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface HeyGenAvatarCreatorProps {
  onAvatarCreated?: (avatarData: any) => void;
}

interface AvatarCreationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function HeyGenAvatarCreator({ onAvatarCreated }: HeyGenAvatarCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [createdAvatar, setCreatedAvatar] = useState<any>(null);

  // HeyGen API configuration
  const HEYGEN_API_KEY = 'YOUR_HEYGEN_API_KEY'; // Replace with your actual API key
  const HEYGEN_BASE_URL = 'https://api.heygen.com/v2';

  const steps: AvatarCreationStep[] = [
    {
      id: 1,
      title: 'Upload Photo',
      description: 'Choose a clear photo of yourself for the avatar',
      completed: !!selectedImage,
    },
    {
      id: 2,
      title: 'Avatar Details',
      description: 'Provide name and voice preferences',
      completed: !!avatarName && !!voiceDescription,
    },
    {
      id: 3,
      title: 'Create Avatar',
      description: 'Generate your AI avatar',
      completed: !!createdAvatar,
    },
  ];

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload an avatar image.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImageToHeyGen = async (imageUri: string): Promise<string | null> => {
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(`${HEYGEN_BASE_URL}/avatars/upload`, {
        method: 'POST',
        headers: {
          'X-API-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: `data:image/jpeg;base64,${base64Image}`,
          avatar_name: avatarName,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.data?.avatar_id || data.avatar_id;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const createAvatar = async () => {
    if (!selectedImage || !avatarName) {
      Alert.alert('Missing Information', 'Please complete all steps before creating your avatar.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Upload image and create avatar
      const avatarId = await uploadImageToHeyGen(selectedImage);
      
      if (!avatarId) {
        throw new Error('Failed to get avatar ID');
      }

      // Step 2: Check avatar creation status
      const statusResponse = await fetch(`${HEYGEN_BASE_URL}/avatars/${avatarId}`, {
        headers: {
          'X-API-Key': HEYGEN_API_KEY,
        },
      });

      const statusData = await statusResponse.json();
      
      if (statusResponse.ok) {
        const avatarData = {
          id: avatarId,
          name: avatarName,
          status: statusData.data?.status || 'processing',
          image_url: statusData.data?.image_url,
          voice_description: voiceDescription,
        };

        setCreatedAvatar(avatarData);
        setCurrentStep(3);
        
        Alert.alert(
          'Avatar Created!',
          `Your avatar "${avatarName}" has been created successfully. It may take a few minutes to fully process.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (onAvatarCreated) {
                  onAvatarCreated(avatarData);
                }
              },
            },
          ]
        );
      } else {
        throw new Error(statusData.message || 'Failed to create avatar');
      }
    } catch (error: any) {
      console.error('Error creating avatar:', error);
      Alert.alert(
        'Creation Failed',
        error.message || 'Failed to create avatar. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestVideo = async () => {
    if (!createdAvatar) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`${HEYGEN_BASE_URL}/video/generate`, {
        method: 'POST',
        headers: {
          'X-API-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: createdAvatar.id,
              },
              voice: {
                type: 'text',
                input_text: `Hello! I'm ${avatarName}, your new AI avatar. Thanks for creating me!`,
              },
            },
          ],
          aspect_ratio: '16:9',
          test: true, // Generate a test video
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Test Video Generating',
          'Your test video is being generated. You can check the status in your HeyGen dashboard.',
        );
      } else {
        throw new Error(data.message || 'Failed to generate test video');
      }
    } catch (error: any) {
      console.error('Error generating test video:', error);
      Alert.alert('Error', error.message || 'Failed to generate test video');
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
              {step.id}
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
        Upload a clear, front-facing photo of yourself. This will be used to create your AI avatar.
      </Text>
      
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
            <Text style={styles.imagePlaceholderSubtext}>Tap to select photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Provide details for your avatar to personalize the experience.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Avatar Name</Text>
        <TextInput
          style={styles.textInput}
          value={avatarName}
          onChangeText={setAvatarName}
          placeholder="Enter your avatar's name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Voice Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={voiceDescription}
          onChangeText={setVoiceDescription}
          placeholder="Describe the desired voice (e.g., professional, friendly, energetic)"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {avatarName && voiceDescription && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(3)}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Ready to create your AI avatar! This process may take a few minutes.
      </Text>

      {!createdAvatar ? (
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.disabledButton]}
          onPress={createAvatar}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create My Avatar</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>🎉 Avatar Created!</Text>
          <Text style={styles.successDescription}>
            Your avatar "{createdAvatar.name}" has been created successfully.
          </Text>
          
          <TouchableOpacity
            style={[styles.testButton, isLoading && styles.disabledButton]}
            onPress={generateTestVideo}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.testButtonText}>Generate Test Video</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Create Your AI Avatar</Text>
        <Text style={styles.headerSubtitle}>
          Transform yourself into a digital avatar for video creation
        </Text>
      </LinearGradient>

      {renderStepIndicator()}

      <View style={styles.content}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
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
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#667eea',
  },
  stepCircleCompleted: {
    backgroundColor: '#28a745',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepTitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '100%',
    width: 50,
    height: 2,
    backgroundColor: '#e9ecef',
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
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  imagePickerButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedImage: {
    width: 196,
    height: 196,
    borderRadius: 98,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
    minWidth: 200,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});