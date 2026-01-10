import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, History } from 'lucide-react';

export const BottomBar = () => {
    const location = useLocation();

    const links = [
        { to: '/dashboard', icon: Home, label: 'Home' },
        { to: '/payment', icon: CreditCard, label: 'Pay' },
        { to: '/transactions', icon: History, label: 'History' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-richBlack border-t border-platinum/10 px-6 py-3">
            <div className="flex justify-around items-center">
                {links.map(({ to, icon: Icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${location.pathname === to ? 'text-appleWhite' : 'text-platinum'
                            }`}
                    >
                        <Icon size={24} />
                        <span className="text-xs">{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};
