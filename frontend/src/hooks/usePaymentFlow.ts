import { useEffect } from 'react';
import { useSecurityStore } from '../store/securityStore';
import { useAuthStore } from '../store/authStore';
import { useGeolocation } from './useGeolocation';
import type { PaymentFlowState } from '../types';

export const usePaymentFlow = () => {
    const { user } = useAuthStore();
    const { setLocation, setBiometric, setFlowState, isInSafeZone, biometricStatus } = useSecurityStore();
    const { location, getLocation, calculateDistance } = useGeolocation();

    const checkSafeZone = () => {
        if (!location || !user?.safeZone) return false;
        const distance = calculateDistance(
            location.latitude,
            location.longitude,
            user.safeZone.latitude,
            user.safeZone.longitude
        );
        return distance < 100; // 100 meters threshold
    };

    const determineFlow = (): PaymentFlowState => {
        const inSafeZone = checkSafeZone();

        // Simpler logic without biometrics:
        // In Safe Zone -> Green (PIN only)
        // Outside Safe Zone -> Amber (OTP + PIN)
        return inSafeZone ? 'green' : 'amber';
    };

    useEffect(() => {
        if (location) {
            const inSafeZone = checkSafeZone();
            setLocation(location, inSafeZone);
        }
    }, [location]);

    useEffect(() => {
        const flow = determineFlow();
        setFlowState(flow);
    }, [isInSafeZone, biometricStatus]);

    return { getLocation, determineFlow, location };
};
