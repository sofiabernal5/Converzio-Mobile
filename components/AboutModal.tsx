// components/AboutModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AboutModal({ visible, onClose }: AboutModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.secondary, Colors.accent, Colors.accent]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>About Converzio</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is Converzio?</Text>
            <Text style={styles.sectionText}>
              Converzio is a revolutionary platform that helps professionals digitize their personal branding through AI-powered video avatars. Create engaging, personalized video content that represents your professional identity.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>AI</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>AI Avatar Creation</Text>
                  <Text style={styles.featureDescription}>
                    Transform your photo into a realistic digital avatar
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>Video</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Video Generation</Text>
                  <Text style={styles.featureDescription}>
                    Create professional videos with your avatar speaking your content
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>Voice</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Custom Voice</Text>
                  <Text style={styles.featureDescription}>
                    Personalize your avatar's voice and speaking style
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>Brand</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Professional Branding</Text>
                  <Text style={styles.featureDescription}>
                    Maintain consistent branding across all your video content
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Create Your Account</Text>
                  <Text style={styles.stepDescription}>
                    Sign up with your email to get started
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Upload Your Photo</Text>
                  <Text style={styles.stepDescription}>
                    Provide a clear photo to create your Digital Twin
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Upload Your Voice Recording</Text>
                  <Text style={styles.stepDescription}>
                    Provide a high quality voice recording for your Digital Twin
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Generate Videos</Text>
                  <Text style={styles.stepDescription}>
                    Create professional videos with your personalized avatar
                  </Text>
                </View>
              </View>
              
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfect For</Text>
            <Text style={styles.sectionText}>
              • Business professionals creating marketing content{'\n'}
              • Educators developing online courses{'\n'}
              • Content creators scaling their video production{'\n'}
              • Sales teams personalizing outreach{'\n'}
              • Anyone looking to establish a strong digital presence
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Started Today</Text>
            <Text style={styles.sectionText}>
              Ready to transform your professional branding? Sign up now and create your first AI avatar in minutes.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 16,
    width: 60,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});