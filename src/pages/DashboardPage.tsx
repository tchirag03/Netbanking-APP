import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WealthCard } from '../components/dashboard/WealthCard';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { accountAPI } from '../services/api';
import { useAccountStore } from '../store/accountStore';

export const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setAccount, setTransactions, account, transactions } = useAccountStore();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                console.log('🔄 Fetching dashboard data...');
                setLoading(true);
                setError(null);

                // Fetch account details
                const accountResponse = await accountAPI.getAccount();
                console.log('✅ Account data:', accountResponse.data);
                setAccount(accountResponse.data);

                // Fetch transactions
                const transactionsResponse = await accountAPI.getTransactions(50);
                console.log('✅ Transactions data:', transactionsResponse.data);
                setTransactions(transactionsResponse.data);
            } catch (error: any) {
                console.error('❌ Error fetching dashboard data:', error);
                setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [setAccount, setTransactions]);

    if (loading) {
        return (
            <div className="p-6 min-h-screen">
                <h1 className="text-3xl font-bold text-appleWhite mb-6">Dashboard</h1>
                <div className="text-platinum text-lg">Loading your account data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 min-h-screen">
                <h1 className="text-3xl font-bold text-appleWhite mb-6">Dashboard</h1>
                <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-red-500">
                    <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <p className="text-sm mt-2">Check console for details</p>
                </div>
            </div>
        );
    }

    console.log('🎨 Rendering dashboard with:', { account, transactionsCount: transactions.length });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
        >
            <h1 className="text-3xl font-bold text-appleWhite mb-6">Dashboard</h1>

            {/* Debug info */}
            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500 rounded text-blue-400 text-sm">
                <p>Account: {account ? `₹${account.balance}` : 'No account data'}</p>
                <p>Transactions: {transactions.length} loaded</p>
            </div>

            <div className="max-w-7xl space-y-6">
                <WealthCard />
                <SpendingChart />
            </div>
        </motion.div>
    );
};
