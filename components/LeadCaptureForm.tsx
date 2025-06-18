// components/LeadCaptureForm.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LeadService, { LeadFormData } from '../services/LeadService';

interface LeadCaptureFormProps {
  visible: boolean;
  onClose: () => void;
  onLeadCaptured?: (leadId: string) => void;
  source?: 'video' | 'form' | 'calendar' | 'direct';
  videoId?: string;
  prefilledData?: Partial<LeadFormData>;
  title?: string;
  subtitle?: string;
}

export default function LeadCaptureForm({
  visible,
  onClose,
  onLeadCaptured,
  source = 'form',
  videoId,
  prefilledData,
  title = 'Get In Touch',
  subtitle = 'Leave your details and we\'ll get back to you soon!',
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: prefilledData?.phone || '',
    company: prefilledData?.company || '',
    message: prefilledData?.message || '',
    source,
    videoId,
    customFields: prefilledData?.customFields || {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const lead = await LeadService.createLead(formData);
      
      Alert.alert(
        'Thank You!',
        'Your information has been submitted successfully. We\'ll be in touch soon!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onLeadCaptured) {
                onLeadCaptured(lead.id);
              }
              handleClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting lead:', error);
      Alert.alert('Error', 'Failed to submit your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      source,
      videoId,
      customFields: {},
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4a90e2', '#357abd']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            {/* Company Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={formData.company}
                onChangeText={(value) => updateField('company', value)}
                placeholder="Enter your company name"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Message Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.message}
                onChangeText={(value) => updateField('message', value)}
                placeholder="Tell us how we can help you..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Source Information */}
            {source === 'video' && videoId && (
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceText}>
                  📹 You're interested in one of our videos
                </Text>
              </View>
            )}

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyText}>
                By submitting this form, you agree to our privacy policy. We respect your privacy and will never share your information with third parties.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={isSubmitting ? ['#cccccc', '#999999'] : ['#28a745', '#20c997']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Send Message'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternative Contact */}
            <View style={styles.alternativeContact}>
              <Text style={styles.alternativeText}>
                Prefer to call? Reach us at{' '}
                <Text style={styles.phoneLink}>(555) 123-4567</Text>
              </Text>
            </View>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  closeButton: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sourceInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  privacyNotice: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  privacyText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alternativeContact: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  alternativeText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  phoneLink: {
    color: '#4a90e2',
    fontWeight: '600',
  },
});