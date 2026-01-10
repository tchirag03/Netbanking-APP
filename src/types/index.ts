// User & Authentication Types
export interface User {
    id: string;
    name: string;
    email: string;
    safeZone?: GeolocationCoordinates;
    faceData?: string; // Base64 encoded face reference
}

export interface GeolocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
}

// Account & Transaction Types
export interface Account {
    id: string;
    balance: number;
    accountNumber: string;
    accountType: 'savings' | 'current';
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    category: string;
    balance: number;
}

// Payment Flow Types
export type PaymentFlowState = 'green' | 'amber' | 'red';

export interface BiometricStatus {
    faceMatched: boolean;
    confidence: number;
}

export interface SecurityState {
    isInSafeZone: boolean;
    currentLocation?: GeolocationCoordinates;
    biometricStatus?: BiometricStatus;
    flowState: PaymentFlowState;
}

// API Response Types
// API Response Types
export interface signupResponse {
    message: string;
    token?: string;
    user?: User;
    userId?: number;
    qrCodeUrl?: string;
    otpauthUrl?: string;
    signal?: number;
}

export interface AuthResponse {
    success?: boolean;
    user?: User;
    token?: string;
    requireTotp?: boolean;
    userId?: number;
    message?: string;
}

export interface ApiError {
    message: string;
    code: string;
}
