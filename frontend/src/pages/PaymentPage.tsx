import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PaymentFlowIndicator } from '../components/payment/PaymentFlowIndicator';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { useSecurityStore } from '../store/securityStore';
import { accountAPI } from '../services/api';
import { Check, Phone, DollarSign, Shield, ArrowRight } from 'lucide-react';

export const PaymentPage = () => {
    const [receiverPhone, setReceiverPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [success, setSuccess] = useState(false);
    const [showTotpPopup, setShowTotpPopup] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { flowState } = useSecurityStore();
    const { getLocation, location } = usePaymentFlow();

    useEffect(() => {
        getLocation();
    }, []);

    const handlePayment = async () => {
        setError('');

        // Validation
        if (!receiverPhone || receiverPhone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (!pin || pin.length !== 4) {
            setError('Please enter your 4-digit PIN');
            return;
        }

        setIsLoading(true);

        try {
            const response = await accountAPI.processPayment(
                receiverPhone,
                parseFloat(amount),
                pin,
                location || undefined,
                flowState === 'amber' && showTotpPopup ? totpCode : undefined
            );

            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Payment failed';

            // If user hasn't set up TOTP at all
            if (err.response?.status === 403 && err.response?.data?.requireTotpSetup) {
                setError('⚠️ You need to set up Google Authenticator in your Profile before making payments outside your safe zone.');
            }
            // If backend asks for TOTP
            else if (err.response?.status === 403 && err.response?.data?.requireTotp) {
                setShowTotpPopup(true);
                setError('');
            } else {
                setError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh] p-6">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50"
                    >
                        <Check size={48} className="text-white" strokeWidth={3} />
                    </motion.div>
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-3"
                    >
                        Payment Successful!
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-300 mb-6"
                    >
                        ₹{amount} sent to {receiverPhone}
                    </motion.p>
                    <Button
                        onClick={() => {
                            setSuccess(false);
                            setReceiverPhone('');
                            setAmount('');
                            setPin('');
                            setTotpCode('');
                            setShowTotpPopup(false);
                        }}
                        variant="secondary"
                    >
                        Make Another Payment
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-2xl mx-auto"
        >
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    Send Money
                </h1>
                <p className="text-slate-400">Fast & secure transfers</p>
            </div>

            <PaymentFlowIndicator />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mt-6 shadow-2xl"
            >
                <div className="space-y-5">
                    {/* Receiver Phone */}
                    <div>
                        <label className="text-slate-300 text-sm mb-2 block font-medium">Receiver Phone Number</label>
                        <Input
                            icon={Phone}
                            type="tel"
                            placeholder="10-digit phone number"
                            value={receiverPhone}
                            onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            maxLength={10}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-slate-300 text-sm mb-2 block font-medium">Amount (₹)</label>
                        <Input
                            icon={DollarSign}
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* PIN */}
                    <div>
                        <label className="text-slate-300 text-sm mb-2 block font-medium">Security PIN</label>
                        <Input
                            icon={Shield}
                            type="password"
                            placeholder="4-digit PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Conditional TOTP Popup */}
                    <AnimatePresence>
                        {showTotpPopup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                            >
                                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl">
                                    <p className="font-semibold mb-1">🔐 Outside Safe Zone Detected</p>
                                    <p className="text-sm text-yellow-300/80">Please enter your Authenticator code to proceed</p>
                                </div>
                                <Input
                                    icon={Shield}
                                    type="text"
                                    placeholder="6-digit Authenticator code"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button onClick={handlePayment} loading={isLoading} className="w-full mt-6 group">
                        {showTotpPopup ? 'Verify & Pay' : 'Confirm Payment'}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};
