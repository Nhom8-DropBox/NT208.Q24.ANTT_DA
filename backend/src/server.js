// server.js
import express from "express";
import "dotenv/config";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.us(auth.js)
// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Test DB connection
app.get("/db-test", async (req, res) => {
  try {
    req.user =     const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Database connection failed",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});