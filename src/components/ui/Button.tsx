import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
}

export const Button = ({ variant = 'primary', loading, children, className = '', disabled, ...rest }: ButtonProps) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-sky-700 text-white hover:bg-sky-600 shadow-lg shadow-sky-700/50';
            case 'secondary':
                return 'bg-slate-700 text-white hover:bg-slate-600 shadow-lg shadow-slate-700/50';
            case 'danger':
                return 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/50';
            default:
                return 'bg-sky-700 text-white hover:bg-sky-600 shadow-lg shadow-sky-700/50';
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${getVariantClasses()} ${className}`}
            disabled={loading || disabled}
            {...rest as any}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                </span>
            ) : children}
        </motion.button>
    );
};
