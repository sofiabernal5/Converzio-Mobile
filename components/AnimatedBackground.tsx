// components/AnimatedBackground.tsx - Updated with new color palette
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground: React.FC = () => {
  const float1 = new Animated.Value(0);
  const float2 = new Animated.Value(0);
  const float3 = new Animated.Value(0);
  const opacity1 = new Animated.Value(0.3);
  const opacity2 = new Animated.Value(0.5);

  useEffect(() => {
    // Floating animation 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 30,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation 2 (offset)
    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 20,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation 3
    Animated.loop(
      Animated.sequence([
        Animated.timing(float3, {
          toValue: 15,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(float3, {
          toValue: -15,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Opacity pulse 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity1, {
          toValue: 0.7,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Opacity pulse 2
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity2, {
          toValue: 0.8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0.4,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Main gradient background using new colors */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Floating gradient orbs with new colors */}
      <Animated.View
        style={[
          styles.floatingOrb1,
          {
            transform: [
              { translateY: float1 },
              { translateX: float2 },
            ],
            opacity: opacity1,
          },
        ]}>
        <LinearGradient
          colors={[`${Colors.primary}40`, `${Colors.primaryLight}20`]}
          style={styles.orb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingOrb2,
          {
            transform: [
              { translateY: float2 },
              { translateX: float1 },
            ],
            opacity: opacity2,
          },
        ]}>
        <LinearGradient
          colors={[`${Colors.accent}30`, `${Colors.primary}15`]}
          style={styles.orb}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingOrb3,
          {
            transform: [
              { translateY: float3 },
              { translateX: float3 },
            ],
            opacity: opacity1,
          },
        ]}>
        <LinearGradient
          colors={[`${Colors.primaryLight}25`, `${Colors.accent}10`]}
          style={[styles.orb, styles.smallOrb]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Static overlay elements with new colors */}
      <View style={[styles.staticOverlay1, { backgroundColor: `${Colors.primary}20` }]} />
      <View style={[styles.staticOverlay2, { backgroundColor: `${Colors.primaryLight}15` }]} />
      <View style={[styles.staticOverlay3, { backgroundColor: `${Colors.accent}25` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingOrb1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.2,
  },
  floatingOrb2: {
    position: 'absolute',
    top: height * 0.4,
    right: width * 0.15,
  },
  floatingOrb3: {
    position: 'absolute',
    bottom: height * 0.3,
    left: width * 0.1,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  smallOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  staticOverlay1: {
    position: 'absolute',
    top: height * 0.2,
    right: width * 0.3,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  staticOverlay2: {
    position: 'absolute',
    bottom: height * 0.2,
    right: width * 0.2,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.primaryLight}25`,
  },
  staticOverlay3: {
    position: 'absolute',
    top: height * 0.6,
    left: width * 0.6,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: `${Colors.accent}40`,
  },
});

export default AnimatedBackground;