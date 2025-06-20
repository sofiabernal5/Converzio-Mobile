// components/SignUpForm.tsx (Updated to store user data after registration)
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../app/config/api';
interface SignUpFormProps {
  onToggleMode: () => void;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

export default function SignUpForm({ onToggleMode }: SignUpFormProps) {
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

  const storeUserData = async (userData: any) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('User data stored successfully:', userData);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
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
      console.log('Attempting registration with:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company
      });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Registration response:', data);
      
      if (data.success) {
        // Store user data locally
        const userData = {
          id: data.user.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company
        };
        await storeUserData(userData);
        
        Alert.alert(
          'Welcome to Converzio!',
          'Account created successfully! Let\'s complete your profile to get the most out of your experience.',
          [
            {
              text: 'Complete Profile',
              onPress: () => router.replace('/profile')
            },
            {
              text: 'Skip for now',
              style: 'cancel',
              onPress: () => router.replace('/home')
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Cannot connect to server. Make sure your backend is running on port 3001.');
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