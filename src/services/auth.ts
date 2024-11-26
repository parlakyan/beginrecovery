import api from './api';
import { useAuthStore } from '../store/authStore';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  role?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
}

export const authApi = {
  login: (data: LoginData) => 
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () => {
    useAuthStore.getState().clearAuth();
  },
  
  getCurrentUser: () => 
    api.get<AuthResponse>('/auth/me')
};