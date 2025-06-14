// context/AuthContext.tsx (Production-Ready Implementation)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking authentication state...');
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        console.log('User authenticated:', currentUser.email);
        setUser(currentUser);
      } else {
        console.log('No authenticated user found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any invalid stored tokens
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error('Error during cleanup logout:', logoutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { user: loggedInUser } = await authService.login({ email, password });
      console.log('Login successful:', loggedInUser.email);
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting registration for:', email);
      const { user: registeredUser } = await authService.register({ 
        email, 
        password, 
        name 
      });
      console.log('Registration successful:', registeredUser.email);
      setUser(registeredUser);
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user:', user?.email);
      await authService.logout();
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
    }
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  console.log('AuthContext state:', {
    hasUser: !!user,
    isLoading,
    isAuthenticated: !!user,
    userEmail: user?.email || 'none'
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};