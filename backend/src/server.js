import express from "express";
import "dotenv/config";
import pool from "./db.js";
import cors from 'cors';
import authRoute from "./routes/auth.js";
import dashboardRoute from "./routes/dashboard.js";
import middlewareAuth from "./middleware/auth.js";
import shareRoute from "./controllers/shareController.js"
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());


app.use('/auth', authRoute);

app.use(`/dashboard`, middlewareAuth, dashboardRoute);

app.use('/share-links', shareRoute)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});