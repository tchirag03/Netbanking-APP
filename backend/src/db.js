import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function connectDB() {
    try {
        await pool.query("SELECT 1");
        console.log("✅ Postgres connected");
    } catch (error) {
        console.log("DB connection failed", error);
        process.exit(1);
    }
}
