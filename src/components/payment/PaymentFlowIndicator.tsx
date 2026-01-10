import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const PaymentFlowIndicator = () => {
    const { flowState } = useSecurityStore();

    const states = {
        green: { color: 'text-green-500', icon: CheckCircle, label: 'Secure - Safe Zone' },
        amber: { color: 'text-yellow-500', icon: AlertTriangle, label: 'Caution - Outside Safe Zone' },
        red: { color: 'text-red-500', icon: XCircle, label: 'High Security - Verification Failed' },
    };

    const { color, icon: Icon, label } = states[flowState];

    return (
        <div className={`flex items-center gap-3 ${color} mb-6`}>
            <Icon size={24} />
            <span className="font-medium">{label}</span>
        </div>
    );
};
