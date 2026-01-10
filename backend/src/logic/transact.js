import { pool } from "../db.js";
import bcrypt from "bcrypt";


export async function debit(from, to, amount, pin, otp) {
    try {
        // Find user by ID
        const fromDetailsResult = await pool.query(
            'SELECT * FROM "User" WHERE id = $1',
            [from]
        );

        if (fromDetailsResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const fromDetails = fromDetailsResult.rows[0];

        if (bcrypt.compareSync(pin, fromDetails.securityPin)) {
            if (otp === -3) {

            }
        }

    } catch (err) {
        console.error('Error in debit:', err);
        throw err;
    }
}