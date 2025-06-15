// app/login.tsx (Cleaned up without Google OAuth)
import React, { useState } from 'react';
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
import AnimatedBackground from '../components/AnimatedBackground';
import SignUpForm from '../components/SignUpForm';
import { TextStyles } from '../constants/typography';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    // Simple validation - in a real app, you'd authenticate with a server
    if (email.includes('@') && password.length >= 6) {
      router.replace('/home');
    } else {
      Alert.alert('Error', 'Invalid credentials. Please check your email and password.');
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
});