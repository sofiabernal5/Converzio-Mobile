// app/avatar-selection.tsx - Updated to focus only on photo avatars
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

  const handleCreateAvatar = () => {
    // Navigate to photo avatar creation
    router.push('/create-photo-avatar');
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
            <Text style={styles.headerTitle}>Create Your Avatar</Text>
            <Text style={styles.headerSubtitle}>
              Transform your photo into an AI-powered digital avatar
            </Text>
          </View>
        </View>

        {/* Main Avatar Card */}
        <View style={styles.avatarCard}>
          <LinearGradient
            colors={['#4a90e2', '#357abd']}
            style={styles.avatarCardGradient}
          >
            <View style={styles.avatarCardContent}>
              <View style={styles.avatarIcon}>
                <Text style={styles.avatarIconText}>📸</Text>
              </View>
              
              <Text style={styles.avatarTitle}>AI Photo Avatar</Text>
              
              <Text style={styles.avatarDescription}>
                Create an AI avatar from a single photo. Perfect for generating professional videos with your own voice and custom scripts.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Upload one clear photo</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Record your natural voice</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Write your custom script (up to 150 words)</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Quick setup (10-15 minutes)</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Professional quality results</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAvatar}
              >
                <LinearGradient
                  colors={['#ffffff', '#f0f0f0']}
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>Create My Avatar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Process Overview */}
        <View style={styles.processSection}>
          <Text style={styles.processSectionTitle}>How It Works</Text>
          
          <View style={styles.processSteps}>
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Upload Photo</Text>
                <Text style={styles.stepDescription}>
                  Choose a clear, front-facing photo of yourself
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Record Voice</Text>
                <Text style={styles.stepDescription}>
                  Record a sample of your voice speaking naturally
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Write Script</Text>
                <Text style={styles.stepDescription}>
                  Create your custom script (up to 150 words)
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Generate Avatar</Text>
                <Text style={styles.stepDescription}>
                  AI creates your personalized digital avatar
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsSectionTitle}>Perfect For</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💼</Text>
              <Text style={styles.benefitText}>Business professionals creating marketing content</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎓</Text>
              <Text style={styles.benefitText}>Educators developing online courses</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📱</Text>
              <Text style={styles.benefitText}>Content creators scaling video production</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📈</Text>
              <Text style={styles.benefitText}>Sales teams personalizing outreach</Text>
            </View>
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleCreateAvatar}
          >
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.getStartedButtonGradient}
            >
              <Text style={styles.getStartedButtonText}>Get Started Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.bottomHelpText}>
            Ready to transform your professional branding? Create your first AI avatar now.
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
  avatarCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  avatarCardGradient: {
    padding: 32,
  },
  avatarCardContent: {
    alignItems: 'center',
  },
  avatarIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarIconText: {
    fontSize: 32,
  },
  avatarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  avatarDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresList: {
    alignItems: 'flex-start',
    marginBottom: 32,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  featureBullet: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 12,
    width: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#4a90e2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  processSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  processSteps: {
    gap: 20,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  benefitsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  benefitsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 32,
  },
  benefitText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  getStartedButton: {
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
  getStartedButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  getStartedButtonText: {
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