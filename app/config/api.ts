// app/config/api.ts
// For Expo development, use a more explicit check
const API_BASE_URL = process.env.NODE_ENV === 'development' || __DEV__
  ? 'http://10.134.171.18:3001'  // Development server
  : 'https://your-production-api.com';  // Production server

console.log('API_BASE_URL:', API_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__DEV__:', __DEV__);

export { API_BASE_URL };