import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, History, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuthStore();

    const links = [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/payment', icon: CreditCard, label: 'Payment' },
        { to: '/transactions', icon: History, label: 'Transactions' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-richBlack border-r border-platinum/10 h-screen fixed left-0 top-0 p-6 z-50">
            <h1 className="text-2xl font-bold text-appleWhite mb-12">CRGT Bank</h1>

            <nav className="flex-1 space-y-2">
                {links.map(({ to, icon: Icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === to
                            ? 'bg-appleWhite text-richBlack'
                            : 'text-platinum hover:bg-platinum/10 hover:text-appleWhite'
                            }`}
                    >
                        <Icon size={20} />
                        <span className="font-medium">{label}</span>
                    </Link>
                ))}
            </nav>

            <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-platinum hover:text-red-500 transition-colors"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </aside>
    );
};
