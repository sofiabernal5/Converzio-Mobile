// app/home.tsx (Home Screen)
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { TextStyles } from '../constants/typography';

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.contentWrapper}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.sloganText}>
              Your professional branding dashboard
            </Text>
            <View style={styles.separator} />
            
            <View style={styles.dashboardContainer}>
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureCardContent}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.3)', 'rgba(53, 122, 189, 0.3)']}
                    style={styles.featureCardGradient}
                  />
                  <Text style={styles.featureTitle}>Video Templates</Text>
                  <Text style={styles.featureDescription}>
                    Create professional videos with our templates
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureCardContent}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.3)', 'rgba(53, 122, 189, 0.3)']}
                    style={styles.featureCardGradient}
                  />
                  <Text style={styles.featureTitle}>Brand Assets</Text>
                  <Text style={styles.featureDescription}>
                    Manage your digital branding materials
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureCardContent}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.3)', 'rgba(53, 122, 189, 0.3)']}
                    style={styles.featureCardGradient}
                  />
                  <Text style={styles.featureTitle}>Analytics</Text>
                  <Text style={styles.featureDescription}>
                    Track your content performance
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  dashboardContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureCardContent: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  featureCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featureTitle: {
    ...TextStyles.body,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    ...TextStyles.caption,
    color: '#ffffff',
    opacity: 0.8,
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    ...TextStyles.caption,
    color: '#ffffff',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
});