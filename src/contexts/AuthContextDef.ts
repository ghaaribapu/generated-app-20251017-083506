import { createContext } from 'react';
import { User } from '@/lib/types';
export type Role = 'Admin' | 'Instructor' | 'Student';
export interface AuthContextType {
  user: User | null;
  role: Role | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'avatarUrl' | 'role'> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refetchUser: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);