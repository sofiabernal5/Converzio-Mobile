// app/login.tsx (Login Screen)
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
import { TextStyles } from '../constants/typography';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    if (email.includes('@') && password.length >= 6) {
      router.replace('home' as any);  // ← Add 'as any'
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
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
            <Text style={styles.welcomeText}>Sign In</Text>
            <Text style={styles.sloganText}>
              Access your professional branding tools
            </Text>
            <View style={styles.separator} />
            
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <TouchableOpacity
                onPress={handleLogin}
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
              
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}>
                <Text style={styles.backButtonText}>← Back to Welcome</Text>
              </TouchableOpacity>
            </View>
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
  welcomeText: {
    ...TextStyles.heading1,
    textAlign: 'center',
    marginBottom: 10,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sloganText: {
    ...TextStyles.slogan,
    textAlign: 'center',
    marginBottom: 30,
    color: '#ffffff',
    opacity: 0.9,
  },
  separator: {
    height: 2,
    width: 80,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    marginBottom: 40,
    borderRadius: 1,
    opacity: 0.5,
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
    ...TextStyles.button,
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 8,
  },
  backButtonText: {
    ...TextStyles.caption,
    color: '#ffffff',
    opacity: 0.8,
  },
});