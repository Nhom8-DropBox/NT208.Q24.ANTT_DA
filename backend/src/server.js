// server.js
import express from "express";
import "dotenv/config";
import pool from "./db.js";
import cors from 'cors';
import middlewareAuth from "./middleware/auth.js";

import authRoute from "./routes/auth.js";

import dashboardRoute from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware
app.use(express.json());

// route
app.use('/auth', authRoute);

// Test route

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use(middlewareAuth); // Apply authentication middleware to all routes after login (have jwt token)

// route cho dashboard
app.use(`/dashboard`, dashboardRoute);

// app.us(auth.js)


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