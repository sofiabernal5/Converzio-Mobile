// app/avatar-selection.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

export default function AvatarSelectionScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'photo' | 'video' | null>(null);

  const handleSelection = (type: 'photo' | 'video') => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) {
      Alert.alert('Selection Required', 'Please choose an avatar type to continue.');
      return;
    }

    if (selectedType === 'photo') {
      // Navigate to photo avatar creation (existing HeyGen flow)
      router.push('/create-photo-avatar');
    } else {
      // Navigate to video avatar creation (new flow)
      router.push('/create-video-avatar');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Choose Avatar Type</Text>
            <Text style={styles.headerSubtitle}>
              Select the type of digital avatar you'd like to create
            </Text>
          </View>
        </View>

        {/* Avatar Type Cards */}
        <View style={styles.optionsContainer}>
          {/* Photo Avatar Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'photo' && styles.selectedCard
            ]}
            onPress={() => handleSelection('photo')}
          >
            <LinearGradient
              colors={selectedType === 'photo' 
                ? ['#4a90e2', '#357abd'] 
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
              }
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.iconText}>PHOTO</Text>
              </View>
              
              <Text style={[
                styles.cardTitle,
                selectedType === 'photo' && styles.selectedCardTitle
              ]}>
                Photo Avatar
              </Text>
              
              <Text style={[
                styles.cardDescription,
                selectedType === 'photo' && styles.selectedCardDescription
              ]}>
                Create an AI avatar from a single photo. Perfect for generating talking head videos with text-to-speech.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'photo' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'photo' && styles.selectedFeatureText
                  ]}>
                    Upload one clear photo
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'photo' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'photo' && styles.selectedFeatureText
                  ]}>
                    Your natural voice
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'photo' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'photo' && styles.selectedFeatureText
                  ]}>
                    Quick setup (5-10 minutes)
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'photo' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'photo' && styles.selectedFeatureText
                  ]}>
                    Best for text-to-speech videos
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={[
                  styles.recommendedText,
                  selectedType === 'photo' && styles.selectedRecommendedText
                ]}>
                  Recommended for beginners
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Video Avatar Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'video' && styles.selectedCard
            ]}
            onPress={() => handleSelection('video')}
          >
            <LinearGradient
              colors={selectedType === 'video' 
                ? ['#28a745', '#20c997'] 
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
              }
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.iconText}>VIDEO</Text>
              </View>
              
              <Text style={[
                styles.cardTitle,
                selectedType === 'video' && styles.selectedCardTitle
              ]}>
                Video Avatar
              </Text>
              
              <Text style={[
                styles.cardDescription,
                selectedType === 'video' && styles.selectedCardDescription
              ]}>
                Create a high-fidelity avatar from video footage. Use your own voice and gestures for maximum authenticity.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'video' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'video' && styles.selectedFeatureText
                  ]}>
                    Upload 2-5 minute video
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'video' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'video' && styles.selectedFeatureText
                  ]}>
                    Your natural voice & gestures
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'video' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'video' && styles.selectedFeatureText
                  ]}>
                    Longer setup (15-30 minutes)
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[
                    styles.featureBullet,
                    selectedType === 'video' && styles.selectedFeatureBullet
                  ]}>•</Text>
                  <Text style={[
                    styles.featureText,
                    selectedType === 'video' && styles.selectedFeatureText
                  ]}>
                    Premium quality results
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={[
                  styles.recommendedText,
                  selectedType === 'video' && styles.selectedRecommendedText
                ]}>
                  Professional quality
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Comparison Section */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Still deciding?</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Setup Time:</Text>
              <Text style={styles.comparisonPhotoValue}>Photo: 5-10 min</Text>
              <Text style={styles.comparisonVideoValue}>Video: 15-30 min</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Voice Quality:</Text>
              <Text style={styles.comparisonPhotoValue}>AI Generated</Text>
              <Text style={styles.comparisonVideoValue}>Your Natural Voice</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Best For:</Text>
              <Text style={styles.comparisonPhotoValue}>Quick Content</Text>
              <Text style={styles.comparisonVideoValue}>Brand Authenticity</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!selectedType}
          >
            <LinearGradient
              colors={selectedType 
                ? (selectedType === 'photo' ? ['#4a90e2', '#357abd'] : ['#28a745', '#20c997'])
                : ['#cccccc', '#999999']
              }
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {selectedType 
                  ? `Continue with ${selectedType === 'photo' ? 'Photo' : 'Video'} Avatar`
                  : 'Select an Option to Continue'
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.bottomHelpText}>
            You can always create additional avatars later from your dashboard
          </Text>
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
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 12,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#ffffff',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 24,
    minHeight: 280,
  },
  cardIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  selectedCardTitle: {
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  selectedCardDescription: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  featuresList: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  featureBullet: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 12,
    width: 8,
  },
  selectedFeatureBullet: {
    color: '#ffffff',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  selectedFeatureText: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: 12,
  },
  recommendedText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedRecommendedText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  comparisonSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  comparisonPhotoValue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    textAlign: 'center',
  },
  comparisonVideoValue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    textAlign: 'right',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomHelpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});