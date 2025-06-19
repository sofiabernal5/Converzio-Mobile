import 'dotenv/config';

export default {
  expo: {
    name: 'Converzio-Mobile',
    slug: 'converzio-mobile',
    scheme: "converzio",
    owner: 'sofiabernal',
    version: '1.0.0',
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission: "This app uses photos to let you select profile pictures and avatars.",
          cameraPermission: "This app uses camera to let you take photos for avatars."
        }
      ],
      [
        "expo-video",
        {
          supportsBackgroundPlayback: false,
          supportsPictureInPicture: false
        }
      ]
    ],
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: "com.sofiabernal.converzio",
      supportsTablet: true,
      buildNumber: "1.0.0",
      infoPlist: {
        NSCameraUsageDescription: "This app uses camera to take photos for avatars and profile pictures.",
        NSMicrophoneUsageDescription: "This app uses microphone for video recording features.",
        NSPhotoLibraryUsageDescription: "This app uses photo library to let you select images for avatars and profile pictures."
      }
    },
    android: {
      package: "com.sofiabernal.converzio",
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
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