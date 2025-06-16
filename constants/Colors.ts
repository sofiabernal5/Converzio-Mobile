// constants/Colors.ts - Updated with new blue color palette
const Colors = {
  // New Brand Colors
  primary: '#00b5d9',        // bright cyan blue
  primaryDark: '#102a43',    // dark navy blue  
  primaryLight: '#6dd3f0',   // light sky blue
  secondary: '#1c3f5b',      // deep blue-gray
  accent: '#4699b3',         // muted teal blue
  lightBlue: '#5a8bc0',
  
  // Semantic Colors
  background: '#102a43',     // dark navy blue
  surface: '#1c3f5b',        // deep blue-gray
  card: 'rgba(70, 153, 179, 0.1)', // muted teal blue with opacity
  
  // Text Colors
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  
  // Status Colors
  success: '#4699b3',
  warning: '#00b5d9',
  error: '#ff6b6b',
  info: '#6dd3f0',
  
  // Utility Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Gradients
  gradient: {
    primary: ['#00b5d9', '#4699b3'],
    secondary: ['#6dd3f0', '#00b5d9'],
    dark: ['#102a43', '#1c3f5b'],
    accent: ['#4699b3', '#1c3f5b'],
  },
  
  // Legacy support (keeping for compatibility)
  light: {
    text: '#102a43',
    background: '#ffffff',
    tint: '#00b5d9',
    tabIconDefault: '#4699b3',
    tabIconSelected: '#00b5d9',
  },
  dark: {
    text: '#ffffff',
    background: '#102a43',
    tint: '#6dd3f0',
    tabIconDefault: '#4699b3',
    tabIconSelected: '#6dd3f0',
  },
};

export default Colors;