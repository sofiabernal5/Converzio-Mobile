// components/SignUpForm.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface SignUpFormProps {
  onToggleMode: () => void;
  onGoogleSignIn: () => void;
  isGoogleSigninInProgress: boolean;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

export default function SignUpForm({ 
  onToggleMode, 
  onGoogleSignIn, 
  isGoogleSigninInProgress 
}: SignUpFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
  });

  const updateField = (field: keyof SignUpData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const { firstName, lastName, email, password, phone, company } = formData;
    
    if (!firstName || !lastName || !email || !password || !phone || !company) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    try {
      // In a real app, you'd send this data to your server
      console.log('Sign up data:', {
        ...formData,
        password: '[HIDDEN]'
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success!',
        'Account created successfully. Welcome to Converzio!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/home')
          }
        ]
      );
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join Converzio and start creating amazing content
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Google Sign In Button */}
        <TouchableOpacity
          style={[styles.googleButton, isGoogleSigninInProgress && styles.disabledButton]}
          onPress={onGoogleSignIn}
          disabled={isGoogleSigninInProgress}>
          <LinearGradient
            colors={isGoogleSigninInProgress ? ['#cccccc', '#999999'] : ['#4285f4', '#34a853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.googleButtonText}>
            {isGoogleSigninInProgress ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
        {/* Name Fields */}
        <View style={styles.nameContainer}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="First Name"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Last Name"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        
        {/* Phone Field */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
          autoCorrect={false}
        />
        
        {/* Company Field */}
        <TextInput
          style={styles.input}
          placeholder="Company"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={formData.company}
          onChangeText={(value) => updateField('company', value)}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {/* Email Field */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Password Field */}
        <TextInput
          style={styles.input}
          placeholder="Create Password (min 6 characters)"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Create Account Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
          </View>
        </TouchableOpacity>
        
        {/* Toggle to Sign In */}
        <TouchableOpacity
          onPress={onToggleMode}
          style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 16,
  },
  halfInput: {
    width: '48%',
    marginBottom: 0,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonWrapper: {
    borderRadius: 25,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggleButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});