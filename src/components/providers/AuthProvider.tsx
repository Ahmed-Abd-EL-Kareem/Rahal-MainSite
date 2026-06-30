'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof document !== 'undefined') {
        const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
        const token = tokenMatch ? tokenMatch[2] : null;
        
        if (token) {
          // Try to parse user from token (JWT) or we could fetch from API
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: payload.sub || payload.id,
              email: payload.email,
              name: payload.name || payload.email,
              avatar: payload.picture || payload.avatar,
            });
          } catch {
            // If token parsing fails, just mark as authenticated
            setUser({ id: '', email: '', name: '' });
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    setUser(userData);
    // Redirect handled by caller
  };

  const logout = () => {
    document.cookie = 'token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const isAuthenticated = !!user;

  // Redirect authenticated users away from auth pages
  // Only runs on initial mount, not on login (which is handled by login page)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
      const isAuthPath = authPaths.some(path => pathname.includes(path));
      
      if (isAuthPath) {
        router.push('/');
        router.refresh();
      }
    }
  }, []); // Run only once on mount to catch pre-existing auth

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}