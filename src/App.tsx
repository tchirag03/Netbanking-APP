import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProfilePage } from './pages/ProfilePage';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomBar } from './components/navigation/BottomBar';
import { useAuthStore } from './store/authStore';
import React from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
    const { isAuthenticated } = useAuthStore();

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-black text-white">
                {isAuthenticated && (
                    <>
                        <Sidebar />
                        <BottomBar />
                    </>
                )}

                <div className={isAuthenticated ? 'md:ml-64 min-h-screen pb-20 md:pb-0' : ''}>
                    <AnimatePresence mode="wait">
                        <Routes>
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="/transactions" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
                            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth'} />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
