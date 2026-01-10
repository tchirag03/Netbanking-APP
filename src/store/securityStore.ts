import { create } from 'zustand';
import type { SecurityState, PaymentFlowState, GeolocationCoordinates, BiometricStatus } from '../types';

interface SecurityStore extends SecurityState {
    setLocation: (location: GeolocationCoordinates, isInSafeZone: boolean) => void;
    setBiometric: (status: BiometricStatus) => void;
    setFlowState: (state: PaymentFlowState) => void;
    reset: () => void;
}

export const useSecurityStore = create<SecurityStore>((set) => ({
    isInSafeZone: false,
    currentLocation: undefined,
    biometricStatus: undefined,
    flowState: 'red',

    setLocation: (location, isInSafeZone) =>
        set({ currentLocation: location, isInSafeZone }),

    setBiometric: (status) =>
        set({ biometricStatus: status }),

    setFlowState: (state) =>
        set({ flowState: state }),

    reset: () =>
        set({ isInSafeZone: false, currentLocation: undefined, biometricStatus: undefined, flowState: 'red' }),
}));
