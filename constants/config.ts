// constants/config.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// IMPORTANT: Replace this with YOUR computer's IP address from step 1
const YOUR_IP_ADDRESS = '10.134.171.56'; // <-- CHANGE THIS TO YOUR IP!

const getLocalIP = () => {
  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Android emulator's alias for localhost
  } else if (Platform.OS === 'web') {
    return 'localhost';
  } else {
    // For iOS simulator
    return YOUR_IP_ADDRESS;
  }
};

const ENV = {
  dev: {
    API_URL: `http://${getLocalIP()}:5001`, // This will use your IP for iOS
    HEYGEN_API_KEY: Constants.expoConfig?.extra?.HEYGEN_API_KEY,
    HEYGEN_API_URL: Constants.expoConfig?.extra?.HEYGEN_API_URL,
  },
  staging: {
    API_URL: 'https://staging-api.converzio.com',
    HEYGEN_API_KEY: Constants.expoConfig?.extra?.HEYGEN_API_KEY,
    HEYGEN_API_URL: Constants.expoConfig?.extra?.HEYGEN_API_URL,
  },
  prod: {
    API_URL: 'https://api.converzio.com',
    HEYGEN_API_KEY: Constants.expoConfig?.extra?.HEYGEN_API_KEY,
    HEYGEN_API_URL: Constants.expoConfig?.extra?.HEYGEN_API_URL,
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  } else if (Constants.manifest?.releaseChannel === 'staging') {
    return ENV.staging;
  }
  return ENV.prod;
};

export default getEnvVars();