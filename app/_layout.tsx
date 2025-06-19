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
        }}
      />
    </>
  );
}