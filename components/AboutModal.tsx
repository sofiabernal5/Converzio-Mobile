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

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#2a5298', '#1e3c72']}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              
              {/* Title */}
              <Text style={styles.title}>What is Converzio?</Text>

              {/* Main description - Paragraph 1 */}
              <View style={styles.paragraph}>
                <Text style={styles.descriptionText}>
                  Converzio is a self-service interactive video platform that empowers professionals to bring their LinkedIn profiles or personal brands to life through{' '}
                  <Text style={styles.highlightedText}>AI-powered avatars</Text>.
                </Text>
              </View>

              {/* Main description - Paragraph 2 */}
              <View style={styles.paragraph}>
                <Text style={styles.descriptionText}>
                  Users can create{' '}
                  <Text style={styles.highlightedText}>personalized, conversational digital experiences</Text>
                  {' '}that answer questions, schedule meetings, capture leads, and showcase expertise—all from a shareable, mobile-friendly interface.
                </Text>
              </View>

              {/* Main description - Paragraph 3 */}
              <View style={styles.paragraph}>
                <Text style={styles.descriptionText}>
                  Whether you're a{' '}
                  <Text style={styles.highlightedText}>job seeker, entrepreneur, or thought leader</Text>, 
                  Converzio transforms your static profile into an engaging, interactive representation of your professional identity.
                </Text>
              </View>

            </ScrollView>

            {/* Got it button */}
            <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.gotItGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.gotItButtonText}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>

          </LinearGradient>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  paragraph: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
    textAlign: 'left',
  },
  highlightedText: {
    color: '#8ab4f8',
    fontWeight: '600',
  },
  gotItButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gotItGradient: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  gotItButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default AboutModal;