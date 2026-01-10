import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, Smartphone, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { authAPI, totpAPI } from '../services/api';

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginStep, setLoginStep] = useState<'credentials' | 'totp'>('credentials');
    const [signupStep, setSignupStep] = useState<'details' | 'totpChoice' | 'totpSetup'>('details');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        pin: '',
        confirmPin: '',
        totpCode: ''
    });
    const [pinError, setPinError] = useState('');
    const [totpError, setTotpError] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const { setUser } = useAuthStore();
    const { location, getLocation, loading: geoLoading } = useGeolocation();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTotpError('');

        try {
            await getLocation();

            const { data } = await authAPI.login(
                formData.phone,
                formData.password,
                location,
                loginStep === 'totp' ? formData.totpCode : undefined
            );

            if (data.requireTotp) {
                setLoginStep('totp');
                setTotpError('You are logging in from an unknown location. Please enter your TOTP code.');
            } else if (data.success && data.token && data.user) {
                setUser(data.user, data.token);
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            if (loginStep === 'totp') {
                setTotpError(error.response?.data?.message || 'Invalid TOTP code');
            } else {
                setTotpError(error.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignupDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinError('');
        setLoading(true);

        try {
            if (formData.pin !== formData.confirmPin) {
                setPinError('PINs do not match');
                setLoading(false);
                return;
            }
            if (formData.pin.length !== 4) {
                setPinError('PIN must be 4 digits');
                setLoading(false);
                return;
            }

            await getLocation();

            const { data } = await authAPI.signup({
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
                pin: formData.pin,
                safeZone: location || { latitude: 0, longitude: 0, accuracy: 0 },
            });

            // Backend returns QR code for TOTP setup
            if (data.qrCodeUrl && data.userId) {
                setQrCodeUrl(data.qrCodeUrl);
                setUserId(data.userId.toString());
                setSignupStep('totpChoice');
            } else if (data.token && data.user) {
                // Direct login if no TOTP setup needed
                setUser(data.user, data.token);
                navigate('/dashboard');
            }

        } catch (error: any) {
            console.error('Signup error:', error);
            setPinError(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSkipTotp = async () => {
        // Just login with existing credentials
        setLoading(true);
        try {
            const { data } = await authAPI.login(formData.phone, formData.password, location);
            if (data.token && data.user) {
                setUser(data.user, data.token);
                navigate('/dashboard');
            }
        } catch (error: any) {
            setTotpError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async () => {
        if (!userId || formData.totpCode.length !== 6) {
            setTotpError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setTotpError('');

        try {
            const { data } = await totpAPI.verify(formData.totpCode, userId);
            if (data.token) {
                setUser(data.user, data.token);
                navigate('/dashboard');
            }
        } catch (error: any) {
            setTotpError(error.response?.data?.message || 'Invalid TOTP code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-richBlack flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <h1 className="text-4xl font-bold text-appleWhite mb-2">CRGT Bank</h1>
                <p className="text-platinum mb-8">Nordic Noir Banking Experience</p>

                <AnimatePresence mode="wait">
                    {/* LOGIN FORM */}
                    {isLogin ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <Input
                                icon={Mail}
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                            <Input
                                icon={Lock}
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            {loginStep === 'totp' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-3 rounded-lg text-sm">
                                        {totpError}
                                    </div>
                                    <Input
                                        icon={Shield}
                                        type="text"
                                        placeholder="Enter Authenticator Code"
                                        value={formData.totpCode}
                                        onChange={(e) => setFormData({ ...formData, totpCode: e.target.value })}
                                        required
                                        autoFocus
                                        maxLength={6}
                                    />
                                </motion.div>
                            )}

                            {totpError && loginStep !== 'totp' && (
                                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                                    {totpError}
                                </div>
                            )}

                            <Button type="submit" loading={loading} className="w-full">
                                {loginStep === 'totp' ? 'Verify Login' : 'Login'}
                            </Button>
                        </motion.form>
                    ) : (
                        <>
                            {/* SIGNUP STEP 1: Details */}
                            {signupStep === 'details' && (
                                <motion.form
                                    key="signup-details"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSignupDetails}
                                    className="space-y-4"
                                >
                                    <Input
                                        icon={User}
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <Input
                                        icon={Mail}
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                    <Input
                                        icon={Lock}
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <Input
                                        icon={Shield}
                                        type="password"
                                        placeholder="4-Digit Security PIN"
                                        value={formData.pin}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setFormData({ ...formData, pin: value });
                                        }}
                                        maxLength={4}
                                        required
                                    />
                                    <Input
                                        icon={Shield}
                                        type="password"
                                        placeholder="Confirm PIN"
                                        value={formData.confirmPin}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setFormData({ ...formData, confirmPin: value });
                                        }}
                                        maxLength={4}
                                        required
                                    />

                                    {pinError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-sm"
                                        >
                                            {pinError}
                                        </motion.p>
                                    )}

                                    <Button type="submit" loading={loading || geoLoading} className="w-full">
                                        Continue
                                    </Button>
                                </motion.form>
                            )}

                            {/* SIGNUP STEP 2: TOTP Choice */}
                            {signupStep === 'totpChoice' && (
                                <motion.div
                                    key="totp-choice"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <Smartphone className="w-16 h-16 mx-auto text-green-500 mb-4" />
                                        <h2 className="text-2xl font-bold text-appleWhite mb-2">Secure Your Account</h2>
                                        <p className="text-platinum text-sm">
                                            Set up Google Authenticator to enable payments from any location.
                                            Without it, you can only make payments from your safe zone.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => setSignupStep('totpSetup')}
                                        className="w-full"
                                    >
                                        <span>Set Up Authenticator</span>
                                        <ChevronRight size={18} />
                                    </Button>

                                    <button
                                        onClick={handleSkipTotp}
                                        disabled={loading}
                                        className="w-full text-platinum hover:text-appleWhite transition-colors text-sm py-2"
                                    >
                                        {loading ? 'Loading...' : 'Skip for Now (Set up later in Profile)'}
                                    </button>
                                </motion.div>
                            )}

                            {/* SIGNUP STEP 3: TOTP Setup */}
                            {signupStep === 'totpSetup' && (
                                <motion.div
                                    key="totp-setup"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-appleWhite mb-4">Scan with Authenticator App</h2>
                                        {qrCodeUrl && (
                                            <img
                                                src={qrCodeUrl}
                                                alt="TOTP QR Code"
                                                className="w-48 h-48 mx-auto bg-white p-2 rounded-lg"
                                            />
                                        )}
                                        <p className="text-platinum text-sm mt-4">
                                            Open Google Authenticator and scan this code
                                        </p>
                                    </div>

                                    <Input
                                        icon={Shield}
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={formData.totpCode}
                                        onChange={(e) => setFormData({ ...formData, totpCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        maxLength={6}
                                    />

                                    {totpError && (
                                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                                            {totpError}
                                        </div>
                                    )}

                                    <Button onClick={handleVerifyTotp} loading={loading} className="w-full">
                                        Verify & Complete Setup
                                    </Button>

                                    <button
                                        onClick={() => setSignupStep('totpChoice')}
                                        className="w-full text-platinum hover:text-appleWhite transition-colors text-sm"
                                    >
                                        ← Back
                                    </button>
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setSignupStep('details');
                        setLoginStep('credentials');
                        setTotpError('');
                        setPinError('');
                    }}
                    className="mt-6 text-platinum hover:text-appleWhite transition-colors text-sm"
                >
                    {isLogin ? 'Create an account' : 'Already have an account?'}
                </button>
            </motion.div>
        </div>
    );
};
