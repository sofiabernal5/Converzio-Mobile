// components/ConverzioLogo.tsx - Simple static logo component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, LinearGradient as SvgGradient, Defs, Stop } from 'react-native-svg';
import Colors from '../constants/Colors';

interface ConverzioLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'default' | 'light' | 'dark';
}

const ConverzioLogo: React.FC<ConverzioLogoProps> = ({ 
  size = 100, 
  showText = true,
  variant = 'default'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          primary: Colors.primary,
          secondary: Colors.primaryLight,
          accent: Colors.accent,
          text: Colors.primaryDark,
        };
      case 'dark':
        return {
          primary: Colors.primaryLight,
          secondary: Colors.primary,
          accent: Colors.accent,
          text: Colors.white,
        };
      default:
        return {
          primary: Colors.primary,
          secondary: Colors.primaryLight,
          accent: Colors.accent,
          text: Colors.white,
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { width: size, height: showText ? size * 1.3 : size }]}>
      {/* Logo Icon */}
      <View style={styles.logoIcon}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <SvgGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.primary} />
              <Stop offset="100%" stopColor={colors.secondary} />
            </SvgGradient>
          </Defs>
          
          {/* Outer Circle */}
          <Circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={colors.accent}
            strokeWidth="2"
            opacity="0.6"
          />
          
          {/* Main C Shape */}
          <Path
            d="M 50 15 C 30 15, 15 30, 15 50 C 15 70, 30 85, 50 85 C 65 85, 78 75, 82 62"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* Inner accent circle */}
          <Circle
            cx="50"
            cy="50"
            r="12"
            fill={colors.primary}
            opacity="0.8"
          />
          
          {/* Small accent dots */}
          <Circle cx="35" cy="25" r="3" fill={colors.secondary} opacity="0.7" />
          <Circle cx="75" cy="65" r="2" fill={colors.accent} opacity="0.8" />
          <Circle cx="25" cy="75" r="2.5" fill={colors.primary} opacity="0.6" />
        </Svg>
      </View>

      {/* Logo Text */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.logoText, { color: colors.text }]}>
            Converzio
          </Text>
          <Text style={[styles.tagline, { color: colors.text }]}>
            AI-Powered Branding
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  textContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default ConverzioLogo;