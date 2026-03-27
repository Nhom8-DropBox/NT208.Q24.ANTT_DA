# Cloud Storage (Simple React + Express Skeleton)

Muc tieu: co bo khung de demo nhanh. Hien tai chua co DB/S3/Proxy; chi la React frontend + Express backend. Thu muc `nginx/` va `docker-compose.yml` chua dien noi dung, de san vi tri cho giai doan sau.

## Cau truc thu muc
```
cloud-storage/
├─ frontend/                  # React (CRA/Vite) app
│  ├─ public/                 # file tinh copy nguyen: index.html (CRA), favicon, logo, manifest, robots.txt, anh/icon
│  ├─ src/
│  │  ├─ components/          # UI block tai su dung (Button, UploadButton, FileRow)
│  │  ├─ pages/               # man hinh (Login, Register, Dashboard, SharePage)
│  │  ├─ hooks/               # logic UI (useAuth, useUpload, useFiles)
│  │  ├─ services/            # goi API: api.js, auth.js, files.js, share.js
│  │  ├─ utils/               # helper nho (format size, chunk split)
│  │  ├─ styles/              # CSS/SCSS/Tailwind config
│  │  ├─ App.js
│  │  └─ index.js
│  ├─ .env                    # REACT_APP_API_URL=http://localhost:3000
│  └─ package.json
│
├─ backend/                   # Node + Express API
│  ├─ src/
│  │  ├─ controllers/         # authController.js, fileController.js, shareController.js
│  │  ├─ services/            # s3Service.js, dbService.js, versionService.js
│  │  ├─ routes/              # auth.js, files.js, shares.js
│  │  ├─ middleware/          # auth.js, errorHandler.js
│  │  ├─ models/              # userModel.js, fileModel.js, ...
│  │  ├─ utils/               # helpers, logger
│  │  ├─ db.js                # ket noi PostgreSQL (neu dung)
│  │  ├─ s3.js                # cau hinh AWS SDK (neu dung)
│  │  └─ server.js            # entry point
│  ├─ .env                    # PORT, DATABASE_URL, AWS_*, JWT_SECRET
│  └─ package.json
│
├─ nginx/                     # (de sau neu can proxy, hien chua co noi dung)
│  ├─ nginx.conf
│  └─ sites/
│     └─ api.yourdomain.com.conf
├─ docker-compose.yml         # (chua dien noi dung)
└─ .gitignore
```

## Cach chay demo cuc nhanh (khong DB)
1) Backend: mo stub in-memory (tam thoi khong goi DB/S3).  
   - `cd backend`  
   - dien scripts vao package.json (vd: `"start": "node src/server.js"`)  
   - `npm install` (them express, cors, multer, jsonwebtoken, dotenv)  
   - `npm start`

2) Frontend: ket noi API  
   - `cd frontend`  
   - tao `.env` voi `REACT_APP_API_URL=http://localhost:3000`  
   - dien scripts (vd: `"start": "vite"` hoac `"start": "react-scripts start"`)  
   - `npm install` (react, axios, etc.)  
   - `npm start`

3) Mo http://localhost:5173 (hoac 3000 tuy tool) de test. API o http://localhost:3000.

## Khi muon nang cap
- Them PostgreSQL, cap nhat `db.js` va model.  
- Them AWS S3 multipart upload vao `s3.js` + `services/s3Service.js`.  
- Dien `docker-compose.yml` de gom API + Postgres (+ Nginx neu can SSL).  
- Cap nhat `nginx` neu ban muon 1 domain duy nhat/SSL.

## Phan cong team 4 nguoi (goi y)
- FE1: auth, layout, routes.
- FE2: upload/list/download UI, services/files.
- BE1: auth, users, middleware.
- BE2: files/uploads/share/version service + routes.

## De khong roi
- Giua FE/BE giu ten feature giong nhau: files, versions, share.  
- Backend: controller (HTTP) -> service (logic) -> model/db (query).  
- Frontend: services (API call) -> hooks (state) -> components/pages (UI).
