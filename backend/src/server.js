import express from "express";
import "dotenv/config";
import pool from "./db.js";
import cors from 'cors';
import authRoute from "./routes/auth.js";
import dashboardRoute from "./routes/dashboard.js";
import middlewareAuth from "./middleware/auth.js";
import shareRoute from "./routes/shares.js"
import filesRoute from "./routes/files.js";

import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser()); // bật parser cookie để parser trường cookie của refresh token

app.use(cors({
    origin: process.env.FE_URL, // chỉ định front end có thể trả về dữ liệu nhạy cảm (cookie)
    credentials: true
}));

app.use(express.json());

app.use('/auth', authRoute);

app.use(`/dashboard`, middlewareAuth, dashboardRoute);

app.use('/share-links', shareRoute)
app.use('/files', middlewareAuth, filesRoute);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
