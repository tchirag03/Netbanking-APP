import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const ProfilePage = () => {
    const [profile, setProfile] = useState<{
        id: number;
        name: string;
        phone: string;
        totpEnabled: boolean;
        createdAt: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [totpStep, setTotpStep] = useState<'idle' | 'setup' | 'verify'>('idle');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { logout } = useAuthStore();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await profileAPI.getProfile();
            setProfile(data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTotpSetup = async () => {
        setError('');
        setTotpStep('setup');
        try {
            const { data } = await profileAPI.getTotpSetup();
            setQrCodeUrl(data.qrCodeUrl);
            setTotpStep('verify');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate QR code');
            setTotpStep('idle');
        }
    };

    const handleVerifyTotp = async () => {
        if (totpCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { data } = await profileAPI.verifyTotp(totpCode);
            if (data.success) {
                setSuccess('TOTP enabled successfully!');
                setTotpStep('idle');
                setTotpCode('');
                fetchProfile(); // Refresh profile
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid TOTP code');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-appleWhite mb-6">Profile</h1>
                <p className="text-platinum">Loading...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-2xl"
        >
            <h1 className="text-3xl font-bold text-appleWhite mb-6">Profile</h1>

            {/* User Info Card */}
            <div className="bg-richBlack/80 border border-platinum/10 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-platinum to-appleWhite rounded-full flex items-center justify-center">
                        <User size={32} className="text-richBlack" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-appleWhite">{profile?.name}</h2>
                        <p className="text-platinum">{profile?.phone}</p>
                    </div>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-platinum">Member Since</span>
                        <span className="text-appleWhite">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* TOTP Status Card */}
            <div className="bg-richBlack/80 border border-platinum/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-appleWhite" size={24} />
                    <h3 className="text-lg font-semibold text-appleWhite">Two-Factor Authentication</h3>
                </div>

                {profile?.totpEnabled ? (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-green-500">Authenticator App is enabled</span>
                    </div>
                ) : (
                    <>
                        {totpStep === 'idle' && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <AlertCircle className="text-yellow-500 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-yellow-500 font-medium">Not Set Up</p>
                                        <p className="text-yellow-500/70 text-sm">
                                            Enable TOTP to make payments from any location
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={handleStartTotpSetup} className="w-full">
                                    <Smartphone size={18} className="mr-2" />
                                    Set Up Authenticator
                                </Button>
                            </div>
                        )}

                        {totpStep === 'verify' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <div className="text-center">
                                    <p className="text-platinum mb-4">Scan this QR code with Google Authenticator</p>
                                    {qrCodeUrl && (
                                        <img
                                            src={qrCodeUrl}
                                            alt="TOTP QR Code"
                                            className="w-48 h-48 mx-auto bg-white p-2 rounded-lg"
                                        />
                                    )}
                                </div>

                                <Input
                                    icon={Shield}
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                />

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => { setTotpStep('idle'); setError(''); }}
                                        className="flex-1 bg-platinum/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleVerifyTotp} loading={loading} className="flex-1">
                                        Verify & Enable
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 bg-green-500/10 border border-green-500 text-green-500 p-3 rounded-lg text-sm"
                    >
                        {success}
                    </motion.div>
                )}
            </div>

            {/* Logout Button */}
            <button
                onClick={logout}
                className="mt-6 w-full text-red-500 hover:text-red-400 transition-colors py-3 border border-red-500/20 rounded-lg"
            >
                Logout
            </button>
        </motion.div>
    );
};
