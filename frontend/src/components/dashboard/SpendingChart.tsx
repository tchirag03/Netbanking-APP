import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { useAccountStore } from '../../store/accountStore';

export const SpendingChart = () => {
    const { transactions } = useAccountStore();

    const chartData = transactions
        .filter((t) => t.type === 'debit')
        .slice(0, 7)
        .reverse()
        .map((t) => ({
            date: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            amount: Math.abs(t.amount),
        }));

    return (
        <Card className="mt-6">
            <h3 className="text-lg font-semibold text-appleWhite mb-4">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#E5E5E5" fontSize={12} />
                    <YAxis stroke="#E5E5E5" fontSize={12} />
                    <Line type="monotone" dataKey="amount" stroke="#F5F5F7" strokeWidth={2} dot={{ fill: '#F5F5F7', r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};
