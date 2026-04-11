// server.js
import express from "express";
import "dotenv/config";
import pool from "./db.js";
import cors from 'cors';

import authRoute from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware
app.use(express.json());

app.use('/auth', authRoute);

// app.us(auth.js)
// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Test DB connection
// app.get("/db-test", async (req, res) => {
//   try {
//     req.user = { id: 1 }; // Giả sử user đã được xác thực và có ID là 1 
//     const result = await pool.query("SELECT NOW()");
//     res.json({
//       success: true,
//       time: result.rows[0],
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       error: "Database connection failed",
//     });
//   }
// });


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});