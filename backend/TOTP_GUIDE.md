# 🔐 TOTP (Google Authenticator) Integration Guide

## Overview
TOTP (Time-based One-Time Password) provides 2FA security using Google Authenticator app. Users scan a QR code once, then enter 6-digit codes during login.

---

## 🎯 Complete Implementation Flow

### **Step 1: Signup - Generate TOTP Secret**

```javascript
import { generateTOTPSecret } from '../utils/totp.js';

export const signup = async (req, res) => {
    const { name, phone, password, securityPin } = req.body;
    
    // 1. Generate TOTP secret
    const { secret, qrCodeUrl, otpauthUrl } = await generateTOTPSecret(
        phone,        // User identifier (shows in Google Authenticator)
        'NetBank'     // App name
    );
    
    // 2. Hash password and PIN
    const passwordHash = await bcrypt.hash(password, 10);
    const securityPinHash = await bcrypt.hash(securityPin, 10);
    
    // 3. Create user with TOTP
    const result = await pool.query(
        `INSERT INTO users 
         (phone, password_hash, full_name, totp_secret, totp_enabled, security_pin_hash) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        [phone, passwordHash, name, secret, true, securityPinHash]
    );
    
    const userId = result.rows[0].id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    
    // 4. Return QR code to frontend
    res.status(201).json({ 
        token, 
        qrCodeUrl,      // Display this as <img src={qrCodeUrl} />
        otpauthUrl      // For manual entry
    });
};
```

---

### **Step 2: Frontend - Display QR Code**

```jsx
// After signup success
const SignupSuccess = ({ qrCodeUrl, otpauthUrl }) => {
    return (
        <div className="totp-setup">
            <h2>Setup Google Authenticator</h2>
            <p>Scan this QR code with Google Authenticator app:</p>
            
            {/* Display QR Code */}
            <img src={qrCodeUrl} alt="TOTP QR Code" />
            
            {/* Manual entry option */}
            <details>
                <summary>Can't scan? Enter manually</summary>
                <code>{otpauthUrl}</code>
            </details>
            
            {/* Verification step */}
            <VerifyTOTP userId={userId} />
        </div>
    );
};
```

---

### **Step 3: Verify Initial TOTP Setup**

```javascript
// Extra security: verify user scanned QR correctly
export const verifyTOTPSetup = async (req, res) => {
    const { userId, totpCode } = req.body;
    
    // Get user's secret
    const result = await pool.query(
        'SELECT totp_secret FROM users WHERE id = $1',
        [userId]
    );
    const user = result.rows[0];
    
    // Verify the code
    const isValid = verifyTOTP(totpCode, user.totp_secret);
    
    if (!isValid) {
        return res.status(400).json({ 
            message: 'Invalid code. Try again.' 
        });
    }
    
    // Mark TOTP as verified
    await pool.query(
        'UPDATE users SET totp_enabled = true WHERE id = $1',
        [userId]
    );
    
    res.json({ message: 'TOTP setup complete!' });
};
```

---

### **Step 4: Login - Require TOTP**

```javascript
import { verifyTOTP } from '../utils/totp.js';

export const login = async (req, res) => {
    const { phone, password, totpCode, location } = req.body;
    
    // 1. Find user
    const result = await pool.query(
        'SELECT * FROM users WHERE phone = $1',
        [phone]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 3. Check if in safe zone
    const isInSafeZone = await checkSafeZone(user.id, location);
    
    // 4. Require TOTP if outside safe zone
    if (!isInSafeZone && user.totp_enabled) {
        if (!totpCode) {
            return res.status(403).json({ 
                requiresTOTP: true,
                message: 'TOTP code required' 
            });
        }
        
        // Verify TOTP
        const isValidTOTP = verifyTOTP(totpCode, user.totp_secret);
        
        if (!isValidTOTP) {
            // Log failed attempt
            await pool.query(
                `INSERT INTO login_history 
                 (user_id, login_status, failure_reason, ip_address) 
                 VALUES ($1, $2, $3, $4)`,
                [user.id, 'failed', 'invalid_totp', req.ip]
            );
            
            return res.status(401).json({ 
                message: 'Invalid TOTP code' 
            });
        }
    }
    
    // 5. Login successful
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    // Log successful login
    await pool.query(
        `INSERT INTO login_history 
         (user_id, login_status, login_method, totp_verified, ip_address) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, 'success', 'password+totp', !isInSafeZone, req.ip]
    );
    
    res.json({ token });
};
```

---

### **Step 5: Frontend Login Flow**

```jsx
const Login = () => {
    const [step, setStep] = useState('credentials'); // 'credentials' | 'totp'
    const [credentials, setCredentials] = useState({});
    
    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    phone: credentials.phone,
                    password: credentials.password,
                    totpCode: credentials.totpCode,
                    location: await getLocation()
                })
            });
            
            const data = await response.json();
            
            // Check if TOTP required
            if (data.requiresTOTP) {
                setStep('totp');
                return;
            }
            
            // Login successful
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
            
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
    
    return (
        <form onSubmit={handleLogin}>
            {step === 'credentials' ? (
                <>
                    <input name="phone" placeholder="Phone" />
                    <input name="password" type="password" placeholder="Password" />
                    <button type="submit">Login</button>
                </>
            ) : (
                <>
                    <p>Enter 6-digit code from Google Authenticator:</p>
                    <input 
                        name="totpCode" 
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                    />
                    <button type="submit">Verify</button>
                </>
            )}
        </form>
    );
};
```

---

## 🛡️ Adaptive Security Integration

Your netbanking app has **3 security levels**:

### **Green Zone** (Safe Location)
- ✅ Password only
- ❌ No TOTP required

### **Amber Zone** (Unknown Location)
- ✅ Password + TOTP
- Optional: SMS OTP as alternative

### **Red Zone** (High-Risk Transaction)
- ✅ Password + TOTP + 4-digit PIN
- For large transactions outside safe zone

```javascript
// Determine security level
const getSecurityLevel = async (userId, location, transactionAmount) => {
    const isInSafeZone = await checkSafeZone(userId, location);
    
    if (isInSafeZone && transactionAmount < 10000) {
        return 'green'; // Password only
    }
    
    if (isInSafeZone || transactionAmount < 50000) {
        return 'amber'; // Password + TOTP
    }
    
    return 'red'; // Password + TOTP + PIN
};
```

---

## 🔑 Backup Codes (Important!)

Users might lose their phone. Provide backup codes:

```javascript
import { generateBackupCodes } from '../utils/totp.js';

// During TOTP setup
const backupCodes = generateBackupCodes();
// Returns: ['A3F2B8X9', 'K9L2M4N6', ...] (10 codes)

// Hash and store
const hashedCodes = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 10))
);

// Add backup_codes column to users table
await pool.query(
    'UPDATE users SET backup_codes = $1 WHERE id = $2',
    [JSON.stringify(hashedCodes), userId]
);

// Show to user ONCE
res.json({ 
    backupCodes,
    message: 'Save these codes! You can only see them once.'
});
```

### Using Backup Codes

```javascript
// In login function
if (!isValidTOTP) {
    // Try backup code
    const result = await pool.query(
        'SELECT backup_codes FROM users WHERE id = $1',
        [user.id]
    );
    
    const backupCodes = JSON.parse(result.rows[0].backup_codes || '[]');
    
    // Check if code matches any backup code
    for (let i = 0; i < backupCodes.length; i++) {
        const isMatch = await bcrypt.compare(totpCode, backupCodes[i]);
        
        if (isMatch) {
            // Remove used backup code
            backupCodes.splice(i, 1);
            await pool.query(
                'UPDATE users SET backup_codes = $1 WHERE id = $2',
                [JSON.stringify(backupCodes), user.id]
            );
            
            // Login successful
            return res.json({ token });
        }
    }
    
    // Neither TOTP nor backup code worked
    return res.status(401).json({ message: 'Invalid code' });
}
```

---

## 📱 Testing TOTP

### Manual Testing
1. Run signup endpoint
2. Copy the `qrCodeUrl` (data:image/png;base64,...)
3. Paste in browser address bar
4. Scan with Google Authenticator
5. Wait for 6-digit code to appear
6. Use code in login endpoint

### Automated Testing
```javascript
import speakeasy from 'speakeasy';

// In your test
const secret = 'JBSWY3DPEHPK3PXP'; // Test secret

// Generate valid code
const validCode = speakeasy.totp({
    secret: secret,
    encoding: 'base32'
});

// Use in test
const response = await request(app)
    .post('/api/auth/login')
    .send({
        phone: '1234567890',
        password: 'password123',
        totpCode: validCode
    });

expect(response.status).toBe(200);
```

---

## ⚙️ Configuration

The `window: 2` parameter in `verifyTOTP` allows for clock drift:
- **Window 0**: Strict (only current 30-sec window)
- **Window 1**: ±30 seconds tolerance
- **Window 2**: ±60 seconds tolerance (recommended)

```javascript
verifyTOTP(token, secret, { window: 2 });
```

---

## 🚨 Security Best Practices

1. ✅ **Always use HTTPS** - TOTP secrets are sensitive
2. ✅ **Never log secrets** - They provide full access
3. ✅ **Rate limit TOTP attempts** - Prevent brute force
4. ✅ **Provide backup codes** - Users lose phones
5. ✅ **Log TOTP failures** - Monitor for attacks
6. ✅ **Allow TOTP disable** - But require verification

---

## 📊 Database Schema Changes Needed

If not already in your schema:

```sql
-- Add to users table
ALTER TABLE users 
ADD COLUMN backup_codes JSONB;

-- Track TOTP in login history
ALTER TABLE login_history 
ADD COLUMN totp_used BOOLEAN DEFAULT false;
```

---

## 🎯 Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateTOTPSecret(name, issuer)` | Create TOTP for new user | `{ secret, qrCodeUrl, otpauthUrl }` |
| `verifyTOTP(code, secret)` | Validate 6-digit code | `boolean` |
| `generateBackupCodes()` | Create recovery codes | `string[]` (10 codes) |

---

## 🐛 Common Issues

### "Invalid TOTP code" but code is correct
- ✅ Check server time is synchronized (NTP)
- ✅ Ensure secret is stored correctly (base32)
- ✅ Try increasing `window` parameter

### QR code won't scan
- ✅ Ensure QR code is large enough (300x300px+)
- ✅ Provide manual entry option (`otpauthUrl`)
- ✅ Check issuer name doesn't have special chars

### Codes work sometimes
- ⚠️ Server time drift - synchronize with NTP
- ⚠️ User changing time zones - window parameter helps
