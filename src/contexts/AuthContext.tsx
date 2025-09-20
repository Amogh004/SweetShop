import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token on app load
    const savedToken = localStorage.getItem('sweet-shop-token');
    const savedUser = localStorage.getItem('sweet-shop-user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Mock API call - replace with actual backend call
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success for demo (admin: admin/admin, user: demo/demo)
      if ((username === 'admin' && password === 'admin') || 
          (username === 'demo' && password === 'demo')) {
        
        const mockUser: User = {
          id: username === 'admin' ? '1' : '2',
          username,
          role: username === 'admin' ? 'admin' : 'user'
        };
        
        const mockToken = `mock-token-${Date.now()}`;
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('sweet-shop-token', mockToken);
        localStorage.setItem('sweet-shop-user', JSON.stringify(mockUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration success
      const mockUser: User = {
        id: `${Date.now()}`,
        username,
        role: 'user'
      };
      
      const mockToken = `mock-token-${Date.now()}`;
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('sweet-shop-token', mockToken);
      localStorage.setItem('sweet-shop-user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sweet-shop-token');
    localStorage.removeItem('sweet-shop-user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};