import 'dotenv/config';

export default {
  expo: {
    name: 'Converzio-Mobile',
    slug: 'converzio-mobile',
    scheme: "converzio",
    owner: 'sofiabernal',
    version: '1.0.0',
    orientation: "portrait",
    icon: "./assets/images/icon.png",
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
      eas: {
        projectId: "62300e2a-15b5-4cde-8ef9-ed2dc2d1bc7b"
      }
    },
  },
};