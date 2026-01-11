import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import "dotenv/config";
import { signup, login, verifyTotp } from "./logic/Auth.js";
import { getAccount } from "./logic/Account.js";
import { getTransactions, processPayment } from "./logic/Transaction.js";
import { getProfile, getTotpSetup, verifyAndEnableTotp } from "./logic/Profile.js";
import { authMiddleware } from "./middleware/auth.js";
import {initializeDatabase} from "./schema/initialize.js";
import cors from "cors";




const app = express();
app.use(express.json());
app.use(cors(
  {
  origin: 'https://crgt-bank-fe.onrender.com', // Your live frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}
));
console.log(process.env.DATABASE_URL);

await connectDB();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Public routes (no auth required)
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.post("/api/totp/verify", verifyTotp);

// Protected routes (auth required)
app.get("/api/account", authMiddleware, getAccount);
app.get("/api/transactions", authMiddleware, getTransactions);
app.post("/api/transactions/pay", authMiddleware, processPayment);

// Profile routes
app.get("/api/profile", authMiddleware, getProfile);
app.get("/api/profile/totp/setup", authMiddleware, getTotpSetup);
app.post("/api/profile/totp/verify", authMiddleware, verifyAndEnableTotp);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
