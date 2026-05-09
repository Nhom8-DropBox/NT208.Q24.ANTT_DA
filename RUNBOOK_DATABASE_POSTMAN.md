# RUNBOOK Database va Postman

## 1. Chay database va MinIO

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA
docker compose up -d
docker ps
```

Mong doi thay:
- `cloud_storage_db`
- `minio_local`

MinIO:
- API: `http://localhost:9000`
- Console: `http://localhost:9001`
- User: `minioadmin`
- Password: `minioadmin123`
- Bucket: `cloud-storage`

Postgres:
- Host: `localhost`
- Port: `5432`
- Database: `cloud_storage`
- User: `postgres`
- Password: `postgres`

## 2. Chay backend

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA\backend
npm install
npm run dev
```

## 3. Register

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

## 4. Login

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

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## 5. Refresh access token

- Method: `POST`
- URL: `http://localhost:3000/auth/refresh`

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "refreshToken": "refresh_token_nhan_duoc_tu_login"
}
```

Response:

```json
{
  "accessToken": "access_token_moi"
}
```

## 6. Header auth cho request `/files`

```text
Authorization: Bearer <accessToken>
```

## 7. Upload init

Dang test bang file notepad, vi du `note.txt`.

De test 2 part hop le:
- tong file > `5MB`
- part 1 = `5MB`
- part 2 = phan con lai

Vi du file tong la `6.5MB`:
- `sizeBytes = 6815744`

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
  "filename": "note.txt",
  "mimeType": "text/plain",
  "sizeBytes": 6815744,
  "fileId": null
}
```

Response mong doi:

```json
{
  "sessionId": 8,
  "uploadId": "...",
  "s3Key": "users/1/files/....-note.txt",
  "chunkSize": 5242880,
  "totalParts": 2,
  "expiresAt": "...",
  "message": "..."
}
```

## 8. part-url cho part 1

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

## 9. PUT part 1 len MinIO

- Method: `PUT`
- URL: dan nguyen gia tri `uploadUrl`

Body:
- chon `binary`
- chon file `part1.txt` hoac `part1.bin`

Yeu cau:
- size part 1 = `5242880` bytes
- `Authorization` tab = `No Auth`

Sau request nay:
- lay `ETag` trong response headers

## 10. part-complete cho part 1

- Method: `POST`
- URL: `http://localhost:3000/files/upload/part-complete`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "sessionId": 8,
  "partNumber": 1,
  "etag": "\"ETAG_PART_1\"",
  "sizeBytes": 5242880
}
```

## 11. part-url cho part 2

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
  "partNumber": 2
}
```

## 12. PUT part 2 len MinIO

- Method: `PUT`
- URL: dan nguyen gia tri `uploadUrl`

Body:
- chon `binary`
- chon file `part2.txt` hoac `part2.bin`

Yeu cau:
- part 2 la part cuoi, co the nho hon `5MB`
- `Authorization` tab = `No Auth`

Sau request nay:
- lay `ETag` trong response headers

## 13. part-complete cho part 2

- Method: `POST`
- URL: `http://localhost:3000/files/upload/part-complete`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "sessionId": 8,
  "partNumber": 2,
  "etag": "\"ETAG_PART_2\"",
  "sizeBytes": 1572864
}
```

## 14. Complete upload

- Method: `POST`
- URL: `http://localhost:3000/files/upload/complete`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "sessionId": 8
}
```

## 15. Query DB

Xem users:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, email, created_at FROM users ORDER BY id;"
```

Xem upload_sessions:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at, created_at FROM upload_sessions ORDER BY id DESC;"
```

Xem upload_parts:

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, upload_session_id, part_number, etag, size_bytes FROM upload_parts ORDER BY id DESC;"
```

