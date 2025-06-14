// app/login.tsx (Updated with Backend Integration)
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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AnimatedBackground from '../components/AnimatedBackground';
import SignUpForm from '../components/SignUpForm';
import { TextStyles } from '../constants/typography';
import { useAuth } from '../context/AuthContext';

// Complete the authentication session
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSigninInProgress, setIsGoogleSigninInProgress] = useState(false);

  // Google OAuth configuration
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '688365172283-h7e8uh28lufbsbg6k7svth125l93v5g9.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: 'https://auth.expo.io/@sofiabernal/converzio-ios',
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        access_type: 'offline',
      },
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      setIsGoogleSigninInProgress(true);
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      Alert.alert('Authentication Error', response.error?.message || 'Something went wrong');
      setIsGoogleSigninInProgress(false);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: '688365172283-h7e8uh28lufbsbg6k7svth125l93v5g9.apps.googleusercontent.com',
          code,
          extraParams: {
            code_verifier: request?.codeVerifier || '',
          },
          redirectUri: 'https://auth.expo.io/@sofiabernal/converzio-ios',
        },
        discovery
      );

      if (tokenResponse.accessToken) {
        await handleGoogleAuthSuccess(tokenResponse);
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      Alert.alert('Error', 'Failed to complete authentication');
      setIsGoogleSigninInProgress(false);
    }
  };

  const handleGoogleAuthSuccess = async (authentication: any) => {
    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${authentication.accessToken}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await userInfoResponse.json();
      
      // Send Google user info to your backend for authentication
      // This would call your backend's Google auth endpoint
      console.log('Google User Info:', userInfo);
      
      Alert.alert(
        'Welcome!', 
        `Hello ${userInfo?.name || 'User'}! You've successfully signed in with Google.`,
        [
          { 
            text: 'Continue', 
            onPress: () => {
              router.replace('/home');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      Alert.alert('Error', 'Failed to get user information');
    } finally {
      setIsGoogleSigninInProgress(false);
    }
  };

  const handleEmailLogin = async () => {
    console.log('=== TESTING BACKEND CONNECTION ===');
    console.log('Email:', email);
    console.log('Attempting to connect to backend...');
    
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      // Test backend connection
      const response = await fetch('http://localhost:5001/api/test');
      const data = await response.json();
      console.log('Backend test response:', data);
      
      Alert.alert('Backend Connection', 'Connected! Check console for details.');
    } catch (error) {
      console.error('Backend connection failed:', error);
      Alert.alert('Backend Connection Failed', 'Cannot connect to backend. Check console.');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!request) {
      Alert.alert('Error', 'Google authentication is not ready yet. Please try again.');
      return;
    }

    try {
      setIsGoogleSigninInProgress(true);
      const result = await promptAsync();
      
      if (result.type === 'cancel') {
        setIsGoogleSigninInProgress(false);
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      Alert.alert('Error', 'Something went wrong with Google sign in');
      setIsGoogleSigninInProgress(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.centerContent}>
          <View style={styles.contentWrapper}>
            {isSignUp ? (
              <SignUpForm 
                onToggleMode={toggleMode}
                onGoogleSignIn={handleGoogleSignIn}
                isGoogleSigninInProgress={isGoogleSigninInProgress}
              />
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Sign In</Text>
                  <Text style={styles.subtitle}>Access your professional branding tools</Text>
                </View>
                
                <View style={styles.formContainer}>
                  {/* Google Sign In Button */}
                  <TouchableOpacity
                    style={[styles.googleButton, (isGoogleSigninInProgress || isLoading) && styles.disabledButton]}
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleSigninInProgress || isLoading || !request}>
                    <LinearGradient
                      colors={(isGoogleSigninInProgress || isLoading) ? ['#cccccc', '#999999'] : ['#4285f4', '#34a853']}
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
                    editable={!isLoading && !isGoogleSigninInProgress}
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
                    editable={!isLoading && !isGoogleSigninInProgress}
                  />
                  
                  <TouchableOpacity
                    onPress={handleEmailLogin}
                    style={styles.buttonContainer}
                    disabled={isLoading || isGoogleSigninInProgress}>
                    <View style={styles.buttonWrapper}>
                      <LinearGradient
                        colors={(isLoading || isGoogleSigninInProgress) ? ['#cccccc', '#999999'] : ['#4a90e2', '#357abd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>SIGN IN</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {/* Small Sign Up text link */}
                  <TouchableOpacity
                    onPress={toggleMode}
                    style={styles.smallSignUpButton}
                    disabled={isLoading || isGoogleSigninInProgress}>
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
              disabled={isLoading || isGoogleSigninInProgress}
            >
              <Text style={styles.backButtonText}>Back to Welcome</Text>
            </TouchableOpacity>
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
});