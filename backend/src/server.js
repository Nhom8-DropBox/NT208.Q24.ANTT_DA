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

app.use(express.json());

app.use(middlewareAuth); 

app.use('/auth', authRoute);

app.use(`/dashboard`, dashboardRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});