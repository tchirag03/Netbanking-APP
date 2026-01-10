import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { useAccountStore } from '../store/accountStore';

export const TransactionHistoryPage = () => {
    const { transactions } = useAccountStore();
    const [search, setSearch] = useState('');

    const filtered = transactions.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-6xl"
        >
            <h1 className="text-3xl font-bold text-appleWhite mb-6">Transaction History</h1>

            <div className="mb-6">
                <Input
                    icon={Search}
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Desktop: Table view */}
            <div className="hidden md:block bg-richBlack/80 border border-platinum/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-platinum/5">
                        <tr>
                            <th className="text-left p-4 text-platinum font-medium">Date</th>
                            <th className="text-left p-4 text-platinum font-medium">Description</th>
                            <th className="text-left p-4 text-platinum font-medium">Category</th>
                            <th className="text-right p-4 text-platinum font-medium">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t) => (
                            <tr key={t.id} className="border-t border-platinum/10">
                                <td className="p-4 text-platinum">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                                <td className="p-4 text-appleWhite">{t.description}</td>
                                <td className="p-4 text-platinum capitalize">{t.category}</td>
                                <td className={`p-4 text-right font-semibold ${t.type === 'credit' ? 'text-green-500' : 'text-appleWhite'}`}>
                                    {t.type === 'credit' ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile: Card view */}
            <div className="md:hidden space-y-3">
                {filtered.map((t) => (
                    <div key={t.id} className="bg-richBlack/80 border border-platinum/10 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {t.type === 'credit' ? (
                                    <ArrowDownLeft className="text-green-500" size={20} />
                                ) : (
                                    <ArrowUpRight className="text-red-500" size={20} />
                                )}
                                <span className="text-appleWhite font-medium">{t.description}</span>
                            </div>
                            <span className={`font-semibold ${t.type === 'credit' ? 'text-green-500' : 'text-appleWhite'}`}>
                                {t.type === 'credit' ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-platinum">
                            <span className="capitalize">{t.category}</span>
                            <span>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
