import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    error?: string;
}

export const Input = ({ icon: Icon, error, className = '', ...props }: InputProps) => {
    return (
        <div className="w-full">
            <div className="relative group">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />}
                <input
                    className={`w-full px-4 ${Icon ? 'pl-11' : ''} py-3.5 bg-slate-800/50 border-2 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-sky-700'
                        } text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-700/20 transition-all duration-200 ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1.5 ml-1">{error}</p>}
        </div>
    );
};
