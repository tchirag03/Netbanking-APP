import axios from 'axios';
import type { signupResponse, AuthResponse, Transaction, BiometricStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface User {
    id: string;
    name: string;
    email: string;
    safeZone?: GeolocationCoordinates;
    faceData?: string; // Base64 encoded face reference
}

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth APIs
export const authAPI = {
    login: (phone: string, password: string, location?: any, totpCode?: string) =>
        api.post<AuthResponse>('/auth/login', { phone, password, location, totpCode }),

    signup: (data: { name: string; phone: string; password: string; pin: string; safeZone: any }) =>
        api.post<signupResponse>('/auth/signup', data),

    logout: () => api.post('/auth/logout'),
};

// Account APIs (protected)
export const accountAPI = {
    getAccount: () => api.get('/account'),
    getTransactions: (limit = 50, offset = 0) =>
        api.get('/transactions', { params: { limit, offset } }),

    processPayment: (receiverPhone: string, amount: number, pin: string, location?: { latitude: number; longitude: number; accuracy: number }, totpCode?: string) =>
        api.post('/transactions/pay', {
            receiverPhone,
            amount,
            pin,
            location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined,
            totpCode
        }),
};

// Transaction APIs (deprecated - use accountAPI.getTransactions)
export const transactionAPI = {
    getAll: () => api.get<Transaction[]>('/transactions'),
    search: (query: string) => api.get<Transaction[]>(`/transactions/search?q=${query}`),
};

// Payment APIs
export const paymentAPI = {
    initiate: (amount: number, recipient: string) =>
        api.post('/payments/initiate', { amount, recipient }),

    verifyLocation: (lat: number, lng: number) =>
        api.post<{ isInSafeZone: boolean }>('/payments/verify-location', { lat, lng }),

    verifyBiometric: (faceData: string) =>
        api.post<BiometricStatus>('/payments/verify-face', { faceData }),

    confirmWithPin: (paymentId: string, pin: string) =>
        api.post('/payments/confirm', { paymentId, pin }),

    confirmWithOTP: (paymentId: string, otp: string, pin: string) =>
        api.post('/payments/confirm-otp', { paymentId, otp, pin }),
};

// TOTP APIs
export const totpAPI = {
    generate: (name: string) =>
        api.post<{ success: boolean; secret: string; qrCodeUrl: string; otpauthUrl: string }>('/totp/generate', { name }),

    verify: (totpCode: string, userId: string) =>
        api.post<{ success?: boolean; user: User; token: string; message?: string; error?: string }>('/totp/verify', { totpCode, userId }),
};

// Profile APIs
export const profileAPI = {
    getProfile: () => api.get<{ id: number; name: string; phone: string; totpEnabled: boolean; createdAt: string }>('/profile'),

    getTotpSetup: () => api.get<{ qrCodeUrl: string; otpauthUrl: string; message: string }>('/profile/totp/setup'),

    verifyTotp: (totpCode: string) => api.post<{ success: boolean; message: string; totpEnabled: boolean }>('/profile/totp/verify', { totpCode }),
};

export default api;
