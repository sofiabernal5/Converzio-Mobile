// constants/config.ts
import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_URL: 'http://localhost:3001', // Use localhost for simulator
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