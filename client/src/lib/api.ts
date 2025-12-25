import axios from 'axios';
import type {
  AuthResponse,
  SignupResponse,
  VerifyEmailResponse,
  GetMeResponse,
  Platform,
  Recipient,
  Schedule,
  Template,
  Log,
  Pagination,
  Stats,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  signup: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post<SignupResponse>('/auth/signup', data);
    return response.data;
  },

  verifyEmail: async (data: { email: string; otp: string }) => {
    const response = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post<{ message: string }>('/auth/resend-otp', { email });
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<GetMeResponse>('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};

// Platform API
export const platformApi = {
  getAll: async () => {
    const response = await api.get<{ platforms: Platform[] }>('/platforms');
    return response.data;
  },

  connectWhatsApp: async () => {
    const response = await api.post<{ message: string }>('/platforms/whatsapp/connect');
    return response.data;
  },

  getWhatsAppStatus: async () => {
    const response = await api.get<{
      isConnected: boolean;
      isClientActive: boolean;
      phoneNumber?: string;
    }>('/platforms/whatsapp/status');
    return response.data;
  },

  disconnectWhatsApp: async () => {
    const response = await api.post<{ message: string }>('/platforms/whatsapp/disconnect');
    return response.data;
  },

  verifyTelegram: async (code: string) => {
    const response = await api.post<{ message: string }>('/platforms/telegram/verify', { code });
    return response.data;
  },

  disconnectTelegram: async () => {
    const response = await api.post<{ message: string }>('/platforms/telegram/disconnect');
    return response.data;
  },
};

// Recipient API
export const recipientApi = {
  getAll: async (platformId?: string) => {
    const params = platformId ? { platformId } : {};
    const response = await api.get<{ recipients: Recipient[] }>('/recipients', { params });
    return response.data;
  },

  create: async (data: { platformId: string; name: string; identifier: string }) => {
    const response = await api.post<{ message: string; recipient: Recipient }>(
      '/recipients',
      data
    );
    return response.data;
  },

  update: async (id: string, data: { name: string; identifier: string }) => {
    const response = await api.put<{ message: string; recipient: Recipient }>(
      `/recipients/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/recipients/${id}`);
    return response.data;
  },
};

// Schedule API
export const scheduleApi = {
  getAll: async () => {
    const response = await api.get<{ schedules: Schedule[] }>('/schedules');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<{ schedule: Schedule }>(`/schedules/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    platformId: string;
    recipients: string[];
    message: string;
    scheduleType: 'once' | 'recurring';
    scheduledAt?: string;
    time?: string;
    days?: string[];
    timezone?: string;
  }) => {
    const response = await api.post<{ message: string; schedule: Schedule }>(
      '/schedules',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      recipients?: string[];
      message?: string;
      time?: string;
      days?: string[];
      isEnabled?: boolean;
    }
  ) => {
    const response = await api.put<{ message: string; schedule: Schedule }>(
      `/schedules/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/schedules/${id}`);
    return response.data;
  },

  toggle: async (id: string) => {
    const response = await api.patch<{ message: string; isEnabled: boolean }>(
      `/schedules/${id}/toggle`
    );
    return response.data;
  },

  test: async (id: string) => {
    const response = await api.post<{ message: string }>(`/schedules/${id}/test`);
    return response.data;
  },
};

// Template API
export const templateApi = {
  getAll: async () => {
    const response = await api.get<{ templates: Template[] }>('/templates');
    return response.data;
  },

  create: async (data: { name: string; category?: string; message: string }) => {
    const response = await api.post<{ message: string; template: Template }>(
      '/templates',
      data
    );
    return response.data;
  },

  update: async (id: string, data: { name?: string; category?: string; message?: string }) => {
    const response = await api.put<{ message: string; template: Template }>(
      `/templates/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/templates/${id}`);
    return response.data;
  },
};

// Log API
export const logApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    scheduleId?: string;
    status?: string;
    platform?: string;
  }) => {
    const response = await api.get<{ logs: Log[]; pagination: Pagination }>('/logs', {
      params,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ stats: Stats }>('/logs/stats');
    return response.data;
  },
};
