import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';

export const WealthCard = () => {
    const { account } = useAccountStore();

    return (
        <Card glass className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-appleWhite/5 to-transparent" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-platinum mb-2">
                    <TrendingUp size={16} />
                    <span className="text-sm uppercase tracking-wide">Total Wealth</span>
                </div>
                <h2 className="text-5xl font-bold text-appleWhite mb-1">
                    ₹{account?.balance.toLocaleString('en-IN') || '0'}
                </h2>
                <p className="text-sm text-platinum">{account?.accountType} • {account?.accountNumber}</p>
            </div>
        </Card>
    );
};
