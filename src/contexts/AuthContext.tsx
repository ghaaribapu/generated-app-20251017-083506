import * as React from 'react';
import { User } from '@/lib/types';
import { AuthContext } from './AuthContextDef';
import { toast } from 'sonner';
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const refetchUser = React.useCallback(async () => {
    const storedUser = localStorage.getItem('acadia-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('acadia-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('acadia-user');
    } finally {
      setLoading(false);
    }
  }, []);
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      const loggedInUser = data.data;
      localStorage.setItem('acadia-user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      toast.success('Login successful!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Login failed: ${errorMessage}`);
      throw error;
    }
  };
  const register = async (userData: Omit<User, 'id' | 'avatarUrl' | 'role'> & { password: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      const registeredUser = data.data;
      localStorage.setItem('acadia-user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      toast.success('Registration successful!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Registration failed: ${errorMessage}`);
      throw error;
    }
  };
  const logout = () => {
    localStorage.removeItem('acadia-user');
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, login, register, logout, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};