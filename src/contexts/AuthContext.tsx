import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; field?: string }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message?: string; field?: string }>;
  logout: () => void;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session on app start
    const savedUser = localStorage.getItem('userconnected');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('userconnected');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; field?: string }> => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userData);
        localStorage.setItem('userconnected', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'فشل في تسجيل الدخول',
          field: data.field 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'خطأ في الاتصال بالخادم' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message?: string; field?: string }> => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          name,
          email,
          password,
          phone
        })
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userData);
        localStorage.setItem('userconnected', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'فشل في إنشاء الحساب',
          field: data.field 
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'خطأ في الاتصال بالخادم' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userconnected');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};