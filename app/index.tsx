// app/index.tsx (Landing Screen - Fixed)
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import AboutModal from '../components/AboutModal';
import { TextStyles } from '../constants/typography';

export default function LandingScreen() {
  const router = useRouter();
  const highlightAnim = new Animated.Value(0);
  const cardScale = new Animated.Value(1);
  const buttonScale = new Animated.Value(1);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    // Continuous highlight animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Subtle breathing animation for the card
    Animated.loop(
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleGetStarted = () => {
    // Use push to maintain navigation stack so back button works
    router.push('/login');
  };

  const highlightOpacity = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

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
              transform: [{ scale: cardScale }],
            },
          ]}>
          <View style={styles.contentWrapper}>
            <Image source={require('../assets/images/Converzio-logo.png')} style={{ width: 350, height: 150, marginBottom: 0}} resizeMode="contain" />
            <Text style={styles.sloganText}>
              Digitize Your Professional Branding
            </Text>
            <View style={styles.separator} />
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleGetStarted}
              style={styles.buttonContainer}>
              <Animated.View
                style={[
                  styles.buttonWrapper,
                  { transform: [{ scale: buttonScale }] },
                ]}>
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.buttonText}>GET STARTED</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowAboutModal(true)}>
              <Text style={styles.infoButtonText}>What is Converzio?</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <AboutModal
        visible={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
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
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonContainer: {
    alignItems: 'center',
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
  infoButton: {
    marginTop: 20,
    padding: 8,
  },
  infoButtonText: {
    ...TextStyles.caption,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#ffffff',
    opacity: 0.8,
  },
});