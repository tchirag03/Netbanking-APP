import { z } from 'zod';
import { pool } from '../db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDistance } from 'geolib';
import { generateTOTPSecret, verifyTOTP } from '../utils/totp.js';

/**
 * Cleanup function to remove unverified TOTP secrets after 30 seconds
 * @param {number} userId - The user ID to check
 */
const scheduleToTPCleanup = (userId) => {
  setTimeout(async () => {
    try {
      // Check if user still has unverified TOTP
      const result = await pool.query(
        'SELECT totp_enabled FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️  User ${userId} not found during TOTP cleanup`);
        return;
      }

      const user = result.rows[0];

      // If TOTP is still not verified, clear the secret
      if (!user.totp_enabled) {
        await pool.query(
          'UPDATE users SET totp_secret = NULL WHERE id = $1',
          [userId]
        );
        console.log(`🧹 Cleaned up unverified TOTP secret for user ${userId}`);
      } else {
        console.log(`✅ User ${userId} verified TOTP in time`);
      }
    } catch (error) {
      console.error(`❌ Error during TOTP cleanup for user ${userId}:`, error);
    }
  }, 30000); // 30 seconds
};

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().length(10, "Phone must be 10 digits"),
  password: z.string().min(4),
  pin: z.string().length(4),
  safeZone: z.object({        // Changed from location
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number(),
  }),
});

export const signup = async (req, res) => {
  try {
    const { name, phone, password, pin, safeZone } = signupSchema.parse(req.body);
    let city = '';
    let country = '';

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${safeZone.latitude}&lon=${safeZone.longitude}&format=json`
      );
      const data = await response.json();
      city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
      country = data.address?.country || 'Unknown';
      console.log(city, country);
    } catch (error) {
      console.log('Geolocation lookup failed:', error);
      // Continue with Unknown city/country
    }

    // Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    const totpstatus = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    const existingUser = existingUserResult.rows[0];
    const totpUser = totpstatus.rows[0];

    if (existingUser && totpUser) {
      return res.status(207).json({ message: 'User already exists', signal: 2 });
    } else if (existingUser && !totpUser) {
      const { secret, qrCodeUrl, otpauthUrl } = await generateTOTPSecret(name);
      return res.status(207).json({ message: 'User already exists', userId: user.id, qrCodeUrl, otpauthUrl, signal: 1 });
    } else {
      const { secret, qrCodeUrl, otpauthUrl } = await generateTOTPSecret(name);
      const passwordHash = bcrypt.hashSync(password, 10);
      const pinHash = bcrypt.hashSync(pin, 10);

      const { latitude, longitude, accuracy } = safeZone;

      const cent = { latitude, longitude };

      // Create new user
      const userResult = await pool.query(
        'INSERT INTO users (name, phone, password_hash, security_pin_hash, totp_secret) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, phone, passwordHash, pinHash, secret]
      );

      const user = userResult.rows[0];

      // Create safezone for user
      await pool.query(
        'INSERT INTO safe_zones (user_id, zone_name, latitude, longitude, radius, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, 'Home', cent.latitude, cent.longitude, 5000, true]
      );

      // Create account for user with initial balance
      const accountNumber = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await pool.query(
        `INSERT INTO accounts (user_id, account_number, ifsc_code, branch_name, account_type, balance, is_primary, account_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, accountNumber, 'CRGT0001', 'Main Branch', 'savings', 10000, true, 'active']
      );

      // Schedule cleanup of TOTP secret if not verified within 30 seconds
      scheduleToTPCleanup(user.id);

      // const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      res.status(201).json({ userId: user.id, qrCodeUrl, otpauthUrl, signal: 1 });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors, signal: 0 });
    }
    console.log(error);
    res.status(500).json({ message: 'Internal server error', signal: 0 });
  }
};



export const login = async (req, res) => {
  try {
    const { phone, password, location, totpCode } = req.body;

    // 1. Find user by phone
    const userResult = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    const user = userResult.rows[0];

    // 2. Validate password FIRST (before any location/TOTP checks)
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password', success: false });
    }

    // 3. Check if user is in safe zone
    let isInSafeZone = false;

    if (location && location.latitude && location.longitude) {
      const safezonesResult = await pool.query(
        'SELECT * FROM safe_zones WHERE user_id = $1 AND is_active = true',
        [user.id]
      );

      const safezones = safezonesResult.rows;

      // Check distance to each safe zone
      for (let i = 0; i < safezones.length; i++) {
        const safezone = safezones[i];
        const distance = getDistance(
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: safezone.latitude, longitude: safezone.longitude }
        );

        // If within safe zone radius
        if (distance <= safezone.radius) {
          isInSafeZone = true;
          break;
        }
      }
    }

    // 4. Handle authentication based on location
    if (isInSafeZone) {
      // User is in safe zone - issue token directly
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone
        },
        requireTotp: false,
        message: 'Login successful from safe zone'
      });
    } else {
      // User is OUTSIDE safe zone - require TOTP

      // If TOTP code is provided, verify it
      if (totpCode) {
        const isTokenValid = verifyTOTP(totpCode, user.totp_secret);

        if (!isTokenValid) {
          return res.status(401).json({ message: 'Invalid TOTP code', success: false });
        }

        // TOTP verified - issue token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone
          },
          requireTotp: false,
          message: 'Login successful with TOTP verification'
        });
      } else {
        // No TOTP code provided - request it
        return res.status(200).json({
          success: true,
          requireTotp: true,
          userId: user.id,
          message: 'TOTP verification required'
        });
      }
    }

  } catch (error) {
    console.log("err at Auth -> login + ", error)
    res.status(500).json({ message: 'Internal server error', success: false })
  }
}
const otpSchema = z.object({
  totpCode: z.string().length(6, "OTP must be 6 digits"),
  userId: z.coerce.number().positive("User ID must be a positive number"),
});


export const verifyTotp = async (req, res) => {
  try {
    const { totpCode, userId } = otpSchema.parse(req.body);
    console.log("totpCode: " + totpCode + " userId: " + userId);
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    const isTokenValid = verifyTOTP(totpCode, user.totp_secret);
    if (!isTokenValid) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const totStatus = await pool.query(
      'UPDATE users SET totp_enabled = $1 WHERE id = $2',
      [true, user.id]
    )

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.status(200).json({ status: true, token });
  } catch (error) {
    console.log("err at Auth -> verifyTotp + ", error)
    res.status(500).json({ message: 'Internal server error' })
  }
}