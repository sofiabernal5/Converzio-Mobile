// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="avatar-selection" />
        <Stack.Screen name="create-photo-avatar" />
        <Stack.Screen name="create-video-avatar" />
        <Stack.Screen name="calendar" />
      </Stack>
    </>
  );
}