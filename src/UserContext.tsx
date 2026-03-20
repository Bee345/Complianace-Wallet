import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from './types';

interface UserContextType {
  user: User | null;
  role: UserRole | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('wallet_user') : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setRole(parsed.role);
      }
    } catch (error) {
      console.error('Failed to access or parse stored user:', error);
      try { localStorage.removeItem('wallet_user'); } catch (e) {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (response.ok) {
        const userData = await response.json();
        const newUser: User = {
          ...userData,
          phoneNumber: userData.phone_number,
          firstName: userData.first_name,
          lastName: userData.last_name,
          name: userData.name || `${userData.first_name} ${userData.last_name}`,
          createdAt: new Date(userData.created_at)
        };
        setUser(newUser);
        setRole(newUser.role);
        localStorage.setItem('wallet_user', JSON.stringify(newUser));
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const userData = await response.json();
        const newUser: User = {
          ...userData,
          phoneNumber: userData.phone_number,
          firstName: userData.first_name,
          lastName: userData.last_name,
          name: userData.name || `${userData.first_name} ${userData.last_name}`,
          createdAt: new Date(userData.created_at)
        };
        setUser(newUser);
        setRole(newUser.role);
        localStorage.setItem('wallet_user', JSON.stringify(newUser));
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    try {
      localStorage.removeItem('wallet_user');
    } catch (e) {
      console.warn('Failed to remove user from localStorage:', e);
    }
  };

  return (
    <UserContext.Provider value={{ user, role, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
