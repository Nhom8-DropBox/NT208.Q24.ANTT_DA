 # Runbook Database va Postman

Tai lieu nay ghi lai cach:
- chay database Postgres
- chay MinIO local
- chay backend
- test cac request bang Postman theo dung code hien tai

## 1. Dieu kien truoc khi chay

Can co:
- Docker Desktop da mo va dang running
- Node.js da cai
- Da chay `npm install` trong thu muc `backend`

Neu `docker compose up -d` bao loi ve `dockerDesktopLinuxEngine` thi la Docker Desktop chua mo.

## 2. Chay database va MinIO

Tai thu muc goc project:

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA
docker compose up -d
```

Kiem tra container:

```powershell
docker ps
```

Mong doi thay:
- `cloud_storage_db`
- `minio_local`

Neu can xem log:

```powershell
docker compose logs postgres
docker compose logs minio
```

## 3. Thong tin ket noi

### Postgres

- Host: `localhost`
- Port: `5432`
- Database: `cloud_storage`
- User: `postgres`
- Password: `postgres`

### MinIO

- API: `http://localhost:9000`
- Console: `http://localhost:9001`
- User: `minioadmin`
- Password: `minioadmin123`
- Bucket dang dung: `cloud-storage`

Neu bucket chua co:
1. Mo `http://localhost:9001`
2. Dang nhap MinIO
3. Tao bucket `cloud-storage`

## 4. Chay backend

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA\backend
npm run dev
```

Neu chay duoc, backend se len:

```text
Server running on http://localhost:3000
```

## 5. Xem database bang psql

Vao psql:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage
```

Thoat:

```sql
\q
```

Query nhanh khong vao interactive shell:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT * FROM users;"
```

## 6. Bang quan trong trong do an

Duoc tao tu [backend/init.sql](c:/Users/Admin/Desktop/NT208.Q24.ANTT_DA/backend/init.sql):

- `users`
- `files`
- `file_versions`
- `upload_sessions`
- `upload_parts`
- `share_links`

## 7. Register bang Postman

Request:
- Method: `POST`
- URL: `http://localhost:3000/auth/register`

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "user_email": "test@example.com",
  "password": "123456"
}
```

Response thanh cong:

```json
{
  "message": "Dang ky thanh cong"
}
```

Kiem tra user trong DB:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, email, created_at FROM users ORDER BY id;"
```

## 8. Login bang Postman

Request:
- Method: `POST`
- URL: `http://localhost:3000/auth/login`

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "user_email": "test@example.com",
  "password": "123456"
}
```

Response thanh cong:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Luu `accessToken` de dung cho cac request can dang nhap.

## 9. Header Authorization cho request co auth

Voi cac API duoi `/files` va `/auth/profile`, them:

```text
Authorization: Bearer <accessToken>
```

## 10. Test profile

Request:
- Method: `GET`
- URL: `http://localhost:3000/auth/profile`

Header:

```text
Authorization: Bearer <accessToken>
```

## 11. Upload init

Endpoint nay tao multipart session trong MinIO va luu vao bang `upload_sessions`.

Request:
- Method: `POST`
- URL: `http://localhost:3000/files/upload/init`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "filename": "video.mp4",
  "mimeType": "video/mp4",
  "sizeBytes": 12345678,
  "fileId": null
}
```

Luu y:
- Phai la `filename`, khong phai `Filename`
- Neu gui `fileId` khong ton tai trong bang `files`, backend se loi khoa ngoai
- De test flow upload moi, co the gui `fileId: null`

Response mong doi:

```json
{
  "sessionId": 8,
  "uploadId": "...",
  "s3Key": "users/1/files/....-video.mp4",
  "chunkSize": 5242880,
  "totalParts": 3,
  "expiresAt": "...",
  "message": "..."
}
```

Kiem tra DB sau request thanh cong:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at, created_at FROM upload_sessions ORDER BY id DESC LIMIT 5;"
```

## 12. Lay part URL

Request:
- Method: `POST`
- URL: `http://localhost:3000/files/upload/part-url`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "sessionId": 8,
  "partNumber": 1
}
```

Response mong doi:

```json
{
  "sessionId": 8,
  "partNumber": 1,
  "uploadUrl": "http://localhost:9000/..."
}
```

Luu y:
- Neu bao `session da het han`, co nghia la session upload het han, khong phai access token het han
- Neu vua tao session xong thi phai dung `sessionId` moi nhat tu buoc `upload/init`

## 13. PUT part that len MinIO

Tao request moi trong Postman:
- Method: `PUT`
- URL: dan nguyen gia tri `uploadUrl`

Body:
- chon `binary`
- chon file that de upload

Rat quan trong:
- Tab `Authorization` phai de `No Auth`
- Khong gui them header `Authorization`
- Vi `uploadUrl` da chua chu ky san

Neu thanh cong thuong se:
- tra `200 OK`
- body response rong hoac gan nhu rong

Can lay `ETag` trong tab `Headers` cua response.

Luu y:
- Sau buoc nay, file thuong chua hien trong MinIO Object Browser
- Vi day moi la upload part, object chi hien sau khi `complete multipart upload`

## 14. Xac nhan part upload xong

Endpoint hien tai da duoc implement trong backend:
- `POST /files/upload/part-complete`

Request:
- Method: `POST`
- URL: `http://localhost:3000/files/upload/part-complete`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body mau:

```json
{
  "sessionId": 8,
  "partNumber": 1,
  "etag": "\"gia-tri-etag-tu-response-header\"",
  "sizeBytes": 12345
}
```

Response mong doi:

```json
{
  "success": true,
  "sessionId": 8,
  "partNumber": 1,
  "message": "Da upload thanh cong"
}
```

Kiem tra bang `upload_parts`:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, upload_session_id, part_number, etag, size_bytes FROM upload_parts ORDER BY id DESC;"
```

## 15. Vi sao MinIO chua thay file trong bucket

Neu da `PUT` part thanh cong ma trong MinIO Object Browser chua thay file, day la binh thuong.

Ly do:
- Ban moi upload tung part
- Chua goi buoc `complete multipart upload`
- Object cuoi cung chi xuat hien sau khi backend goi complete

Hien tai trong code:
- `part-complete` da co
- `completeMultipartUpload` chua implement

Nen file chua hien trong bucket la dung voi trang thai hien tai.

## 16. Cac loi thuong gap

### Loi Docker engine

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

Nghia la Docker Desktop chua mo.

### Loi foreign key khi upload init

```text
violates foreign key constraint "upload_sessions_file_id_fkey"
```

Nghia la `fileId` gui len khong ton tai trong bang `files`.

De test nhanh:

```json
{
  "filename": "video.mp4",
  "mimeType": "video/mp4",
  "sizeBytes": 12345678,
  "fileId": null
}
```

### Loi session het han

Thuong do:
- dang dung lai `sessionId` cu
- `expires_at` cua upload session da qua han

Phai goi lai `upload/init` de lay `sessionId` moi.

### Loi multiple authentication types khi PUT MinIO

Thong bao kieu:

```text
Invalid Request (request has multiple authentication types, please use one)
```

Nghia la request `PUT uploadUrl` dang gui them auth header.

Sua bang cach:
- `Authorization` -> `No Auth`
- xoa header `Authorization`

## 17. Query hay dung de debug

Xem user:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, email, created_at FROM users ORDER BY id;"
```

Xem upload sessions:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at, created_at FROM upload_sessions ORDER BY id DESC;"
```

Xem upload parts:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, upload_session_id, part_number, etag, size_bytes FROM upload_parts ORDER BY id DESC;"
```

Xem files:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, name, created_at, deleted_at FROM files ORDER BY id;"
```

## 18. Trang thai hien tai cua flow upload

Dang chay duoc:
- `upload/init`
- `upload/part-url`
- `PUT uploadUrl` len MinIO
- `upload/part-complete`

Chua xong:
- `upload/complete`
- hien object cuoi cung trong bucket sau complete

