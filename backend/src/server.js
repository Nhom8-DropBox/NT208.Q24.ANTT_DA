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
app.use('/public', shareRoute);
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // ==========================================
  // 🛠️ ĐOẠN CODE DEBUG DATABASE (TẦNG 1)
  // Chạy ngay khi khởi động server
  // ==========================================
  try {
    const client = await pool.connect();
    console.log("Kết nối Database thành công!");
    client.release(); // Trả kết nối lại cho Pool sau khi test xong
  } catch (err) {
    console.error("Lỗi kết nối Database ngay lúc khởi động:");
    console.error("Nguyên nhân:", err.message);
  }
  // ==========================================
});


// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
