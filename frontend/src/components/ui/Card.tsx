import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    glass?: boolean;
    className?: string;
}

export const Card = ({ children, glass, className = '' }: CardProps) => {
    const glassStyles = glass
        ? 'bg-glass-white backdrop-blur-glass border border-platinum/20'
        : 'bg-richBlack/80 border border-platinum/10';

    return (
        <div className={`rounded-2xl p-6 ${glassStyles} ${className}`}>
            {children}
        </div>
    );
};
