// app/login.tsx (Updated with better error handling and connection testing)
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';
import SignUpForm from '../components/SignUpForm';
import { TextStyles } from '../constants/typography';
import { API_BASE_URL, testConnection, getDebugInfo } from './config/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  // Test connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    console.log('Testing connection...', getDebugInfo());
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    
    if (!isConnected) {
      console.warn('Backend connection failed. Make sure backend is running on:', API_BASE_URL);
    } else {
      console.log('Backend connection successful:', API_BASE_URL);
    }
  };

  const storeUserData = async (userData: any) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('User data stored successfully:', userData);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    console.log('➡️ Sending login request to:', `${API_BASE_URL}/api/auth/login`);

    // Check connection first
    if (connectionStatus === 'disconnected') {
      Alert.alert(
        'Connection Error', 
        `Cannot connect to server at ${API_BASE_URL}. Please check:\n\n1. Backend is running\n2. Your device is on the same network\n3. IP address is correct`,
        [
          { text: 'Retry Connection', onPress: checkConnection },
          { text: 'Continue Anyway', onPress: () => attemptLogin() }
        ]
      );
      return;
    }
    
    attemptLogin();
  };

  const attemptLogin = async () => {
    try {
      console.log('Attempting login with:', { email, apiUrl: API_BASE_URL });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        // Store user data locally
        await storeUserData(data.user);
        
        Alert.alert('Success!', `Welcome back, ${data.user.firstName} ${data.user.lastName}!`);
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', data.message);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Connection timed out. Please check your network and try again.');
      } else if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error', 
          `Cannot connect to server at ${API_BASE_URL}.\n\nPlease ensure:\n• Backend server is running\n• Your device is connected to the same network\n• IP address (10.134.171.18) is correct`,
          [
            { text: 'Test Connection', onPress: checkConnection },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Error', `Login failed: ${error.message}`);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#28a745';
      case 'disconnected': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Connected to backend';
      case 'disconnected': return '🔴 Cannot connect to backend';
      default: return '🟡 Testing connection...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Connection Status Indicator */}
        <View style={styles.connectionStatus}>
          <Text style={[styles.connectionText, { color: getConnectionStatusColor() }]}>
            {getConnectionStatusText()}
          </Text>
          <TouchableOpacity onPress={checkConnection} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>↻ Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <View style={styles.contentWrapper}>
            {isSignUp ? (
              <SignUpForm onToggleMode={toggleMode} />
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Sign In</Text>
                  <Text style={styles.subtitle}>Access your professional branding tools</Text>
                </View>
                
                <View style={styles.formContainer}>
                  {/* Email/Password Form */}
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  
                  <TouchableOpacity
                    onPress={handleEmailLogin}
                    style={styles.buttonContainer}>
                    <View style={styles.buttonWrapper}>
                      <LinearGradient
                        colors={['#4a90e2', '#357abd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={styles.buttonText}>SIGN IN</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Small Sign Up text link */}
                  <TouchableOpacity
                    onPress={toggleMode}
                    style={styles.smallSignUpButton}>
                    <Text style={styles.smallSignUpText}>
                      Don't have an account? Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            {/* Back to Welcome Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back to Welcome</Text>
            </TouchableOpacity>

            {/* Debug Info (only in development) */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>Debug Info:</Text>
                <Text style={styles.debugText}>API URL: {API_BASE_URL}</Text>
                <Text style={styles.debugText}>Status: {connectionStatus}</Text>
              </View>
            )}
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
    marginBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
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
  backButton: {
    marginTop: 20,
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 14,
  },
  smallSignUpButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  smallSignUpText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
  },
  debugText: {
    color: '#ffffff',
    fontSize: 10,
    opacity: 0.8,
  },
});