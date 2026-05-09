# RUNBOOK Database va Postman

Runbook nay dung cho repo:
- root: `C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA`
- backend: [backend](c:/Users/Admin/Desktop/NT208.Q24.ANTT_DA/backend)

No gom 4 phan:
1. chay Postgres va MinIO
2. chay backend
3. request Postman
4. query DB de kiem tra

## 1. Chay database va MinIO

Project dang dung `docker-compose.yml` o thu muc goc: [docker-compose.yml](c:/Users/Admin/Desktop/NT208.Q24.ANTT_DA/docker-compose.yml)

### 1.1. Mo Docker Desktop

Neu chay `docker compose up -d` ma bao loi:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

thi nghia la Docker Desktop chua mo. Hay:
- mo `Docker Desktop`
- cho den khi no bao da running

### 1.2. Chay container

Tai root repo:

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA
docker compose up -d
```

### 1.3. Kiem tra container

```powershell
docker ps
```

Mong doi thay:
- `cloud_storage_db`
- `minio_local`

### 1.4. Xem log neu can

```powershell
docker compose logs postgres
docker compose logs minio
```

## 2. Thong tin ket noi

### 2.1. PostgreSQL

- Host: `localhost`
- Port: `5432`
- Database: `cloud_storage`
- User: `postgres`
- Password: `postgres`

Schema duoc tao tu [backend/init.sql](c:/Users/Admin/Desktop/NT208.Q24.ANTT_DA/backend/init.sql)

### 2.2. MinIO

- API: `http://localhost:9000`
- Console: `http://localhost:9001`
- User: `minioadmin`
- Password: `minioadmin123`
- Bucket: `cloud-storage`

Neu chua co bucket:
1. vao `http://localhost:9001`
2. dang nhap MinIO
3. tao bucket `cloud-storage`

## 3. Chay backend

Tai thu muc backend:

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA\backend
npm install
npm run dev
```

Mong doi:

```text
Server running on http://localhost:3000
```

Backend dang doc config tu [backend/.env](c:/Users/Admin/Desktop/NT208.Q24.ANTT_DA/backend/.env)

## 4. Cach vao database de query

### 4.1. Vao psql interactive

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage
```

Thoat:

```sql
\q
```

### 4.2. Chay query 1 dong tu PowerShell

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT * FROM users;"
```

## 5. Cac bang quan trong

Trong DB hien co:
- `users`
- `files`
- `file_versions`
- `upload_sessions`
- `upload_parts`
- `share_links`

## 6. Flow request tren Postman

Thu tu nen test:
1. register
2. login
3. upload init
4. part-url cho part 1
5. PUT part 1 len MinIO
6. part-complete cho part 1
7. part-url cho part 2
8. PUT part 2 len MinIO
9. part-complete cho part 2
10. complete upload

## 7. Register

### Request

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

### Response mong doi

```json
{
  "message": "Dang ky thanh cong"
}
```

### Query kiem tra user

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, email, created_at FROM users ORDER BY id;"
```

## 8. Login

### Request

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

### Response mong doi

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Luu:
- copy `accessToken`
- cac request duoi `/files` phai dung header:

```text
Authorization: Bearer <accessToken>
```

## 9. Chuan bi file de test 2 part

De tranh loi `EntityTooSmall`, ban can test file tong kich thuoc lon hon `5MB`.

Muc tieu:
- part 1 = `5MB`
- part 2 = phan con lai

### Cach de test de nhat

Dung mot file tong kich thuoc khoang `6MB` den `10MB`.

Vi du:
- file `video.mp4` co size `6.5MB`

Khi do:
- part 1 = `5MB`
- part 2 = `1.5MB`

Dieu nay hop le vi:
- moi part tru part cuoi cung phai >= `5MB`
- part cuoi cung co the nho hon `5MB`

### Luu y rat quan trong

Neu ban dung Postman de PUT len MinIO, Postman se gui ca file ban chon, no khong tu cat chunk cho ban.

Vi vay de test dung `2 part`, ban phai chuan bi san:
- `part1.bin` co size dung `5MB`
- `part2.bin` la phan con lai

Neu ban khong co tool cat file, cach de demo de nhat la:
- dung 2 file test thu cong
- trong do file part 1 phai >= `5MB`
- file part 2 la part cuoi

## 10. Upload init

Day la buoc tao `upload session` va tao multipart upload tren MinIO.

### Request

- Method: `POST`
- URL: `http://localhost:3000/files/upload/init`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Body de test 2 part:

```json
{
  "filename": "video.mp4",
  "mimeType": "video/mp4",
  "sizeBytes": 6815744,
  "fileId": null
}
```

`6815744` byte = `6.5MB`

### Luu y

- phai la `filename`, khong phai `Filename`
- neu gui `fileId: 1` ma trong bang `files` khong co row `id = 1`, backend se loi foreign key
- de test upload moi, dung `fileId: null` la de nhat

### Response mong doi

```json
{
  "sessionId": 8,
  "uploadId": "...",
  "s3Key": "users/1/files/....-video.mp4",
  "chunkSize": 5242880,
  "totalParts": 2,
  "expiresAt": "...",
  "message": "..."
}
```

### Query kiem tra upload_sessions

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at, created_at FROM upload_sessions ORDER BY id DESC LIMIT 5;"
```

## 11. Lay part URL cho part 1

### Request

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

### Response mong doi

```json
{
  "sessionId": 8,
  "partNumber": 1,
  "uploadUrl": "http://localhost:9000/..."
}
```

## 12. PUT part 1 len MinIO

### Request

- Method: `PUT`
- URL: dan nguyen gia tri `uploadUrl` cua part 1

Body:
- chon `binary`
- chon file `part1.bin`

### Dieu kien

- `part1.bin` phai co size dung `5242880` byte = `5MB`
- tab `Authorization` phai la `No Auth`
- khong gui them `Authorization: Bearer ...`

### Response mong doi

- `200 OK`
- body rong la binh thuong

Sau do vao response headers va copy `ETag`

## 13. part-complete cho part 1

### Request

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

### Response mong doi

```json
{
  "success": true,
  "sessionId": 8,
  "partNumber": 1
}
```

## 14. Lay part URL cho part 2

### Request

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

## 15. PUT part 2 len MinIO

### Request

- Method: `PUT`
- URL: dan nguyen gia tri `uploadUrl` cua part 2

Body:
- chon `binary`
- chon file `part2.bin`

### Dieu kien

- `part2.bin` la part cuoi, nen co the nho hon `5MB`
- tab `Authorization` phai la `No Auth`

### Response mong doi

- `200 OK`
- body rong la binh thuong

Copy `ETag` tu response headers

## 16. part-complete cho part 2

### Request

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

`1572864` byte = `1.5MB`

## 17. Query kiem tra upload_parts

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, upload_session_id, part_number, etag, size_bytes FROM upload_parts ORDER BY id DESC;"
```

Ban mong doi thay 2 row:
- `part_number = 1`
- `part_number = 2`

## 18. Complete multipart upload

Chi goi buoc nay khi:
- da upload xong part 1
- da upload xong part 2
- da luu ca 2 part vao bang `upload_parts`

### Request

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

### Response mong doi

```json
{
  "success": true,
  "sessionId": 8,
  "message": "Multipart upload completed"
}
```

### Sau khi complete

Luc nay object moi co the hien trong MinIO bucket `cloud-storage`.

## 19. Tai sao trong MinIO chua thay file ngay

Neu ban moi:
- `upload/init`
- `part-url`
- `PUT` part

ma chua thay file trong bucket thi la binh thuong.

Ly do:
- multipart upload dang o trang thai tam
- object cuoi cung chi xuat hien sau khi `complete multipart upload`

## 20. Cac query debug hay dung

### Xem users

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, email, created_at FROM users ORDER BY id;"
```

### Xem files

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, name, deleted_at, created_at FROM files ORDER BY id;"
```

### Xem upload_sessions

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at, created_at FROM upload_sessions ORDER BY id DESC;"
```

### Xem upload_parts

```powershell
docker exec -it cloud_storage_db psql -U postgres -d cloud_storage -c "SELECT id, upload_session_id, part_number, etag, size_bytes FROM upload_parts ORDER BY id DESC;"
```

## 21. Loi hay gap

### 21.1. Docker chua mo

Loi:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

Cach xu ly:
- mo Docker Desktop
- cho no running
- chay lai `docker compose up -d`

### 21.2. Loi `fileId` khong ton tai

Loi:

```text
violates foreign key constraint "upload_sessions_file_id_fkey"
```

Cach xu ly:
- gui `fileId: null`
- hoac gui `fileId` that co trong bang `files`

### 21.3. Loi `session da het han`

Y nghia:
- upload session het han
- khong lien quan truc tiep toi access token

Cach xu ly:
- goi lai `upload/init`
- lay `sessionId` moi

### 21.4. Loi MinIO `multiple authentication types`

Loi:

```text
Invalid Request (request has multiple authentication types, please use one)
```

Cach xu ly:
- request `PUT uploadUrl` phai de `No Auth`
- xoa header `Authorization`

### 21.5. Body response PUT rong

Day la binh thuong. Sau request `PUT`, dieu quan trong la:
- status `200 OK`
- lay `ETag` tu response headers

### 21.6. Loi `EntityTooSmall`

Loi:

```text
EntityTooSmall: Your proposed upload is smaller than the minimum allowed object size
```

Y nghia:
- part khong phai part cuoi cung ma nho hon `5MB`

Cach xu ly:
- part 1 phai >= `5MB`
- chi part cuoi cung moi duoc nho hon `5MB`

## 22. Reset DB neu can

Canh bao: lenh nay xoa du lieu cu.

```powershell
cd C:\Users\Admin\Desktop\NT208.Q24.ANTT_DA
docker compose down -v
docker compose up -d
```

Sau do `init.sql` se duoc chay lai tren database moi.

