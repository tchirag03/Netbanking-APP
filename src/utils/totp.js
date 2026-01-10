import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate TOTP secret for a new user
 * @param {string} userName - User's name for labeling in Google Authenticator
 * @param {string} issuer - App name (e.g., "NetBank")
 * @returns {Promise<{secret: string, qrCodeUrl: string, otpauthUrl: string}>}
 */
export const generateTOTPSecret = async (userName, issuer = 'CRGT Bank') => {
    // Generate secret
    const secret = speakeasy.generateSecret({
        name: `${issuer} (${userName})`,
        issuer: issuer,
        length: 32,
    });

    // Generate QR code as Data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32, // Store this in database
        qrCodeUrl, // Send this to frontend to display
        otpauthUrl: secret.otpauth_url,
    };
};

/**
 * Verify TOTP token
 * @param {string} token - 6-digit token from Google Authenticator
 * @param {string} secret - User's TOTP secret from database
 * @returns {boolean} - True if valid, false otherwise
 */
export const verifyTOTP = (token, secret) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, // Allow 2 time steps before/after for clock drift
    });
};

/**
 * Generate a backup code (for account recovery)
 * @returns {string[]} - Array of 10 backup codes
 */
export const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
};
