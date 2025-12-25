export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

export interface Platform {
  id?: string;
  platform: 'email' | 'whatsapp' | 'telegram';
  isVerified: boolean;
  data?: {
    email?: string;
    phoneNumber?: string;
    username?: string;
  };
  connectedAt?: string;
  lastUsed?: string;
}

export interface Recipient {
  _id: string;
  userId: string;
  platformId: Platform | string;
  name: string;
  identifier: string;
  createdAt: string;
}

export interface Schedule {
  _id: string;
  userId: string;
  platformId: Platform | string;
  name: string;
  recipients: Recipient[] | string[];
  message: string;
  scheduleType: 'once' | 'recurring';
  scheduledAt?: string;
  cronExpression?: string;
  time?: string;
  days?: string[];
  timezone: string;
  isEnabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
}

export interface Template {
  _id: string;
  userId?: string;
  name: string;
  category: string;
  message: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Log {
  _id: string;
  userId: string;
  scheduleId: Schedule | string;
  platform: 'email' | 'whatsapp' | 'telegram';
  recipientIdentifier: string;
  message: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Stats {
  totalSent: number;
  totalFailed: number;
  todaySent: number;
  successRate: number;
  platforms: Record<string, { sent: number; failed: number }>;
}

// API Responses
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface VerifyEmailResponse extends AuthResponse {
  message: string;
}

export interface GetMeResponse {
  user: User;
  platforms: Platform[];
}

export interface ApiError {
  message: string;
}
