import 'dotenv/config';

export default {
  expo: {
    name: 'Converzio',
    slug: 'converzio',
    scheme: "converzio",
    version: '1.0.0',
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    plugins: ["expo-router"],
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: "com.sofiabernal.converzio",
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
      HEYGEN_API_URL: process.env.HEYGEN_API_URL,
    },
  },
};