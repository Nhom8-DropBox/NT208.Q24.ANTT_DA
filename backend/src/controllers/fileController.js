import pool from "../db.js";
import { completeUpload, createMultipartUpload, getPartPresignedUrl, GetDownloadURL, deleteObject, abortUpload } from "../s3.js";

const fileController = {
    initMultipartUpload: async (req, res) => {
        const { filename, mimeType, sizeBytes, fileId } = req.body;
        const userId = req.user.userID;
        const chunkSize = 5 * 1024 * 1024;
        const totalParts = Math.ceil(sizeBytes / chunkSize);
        const uniquePart = Date.now();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const s3Key = `users/${userId}/files/${uniquePart}-${filename}`;

        try {
            // Kiểm tra xem đã có session nào đang pending cho file này chưa (dựa vào fileId và owner_id)
            const existSession = await pool.query(
                `SELECT * FROM upload_sessions WHERE owner_id = $1 AND filename = $2 AND status = 'pending' AND expires_at > NOW()`,
                [userId, filename]
            );

            if (existSession.rows.length > 0) {
                // Có session đang pending -> Resume
                const session = existSession.rows[0];

                // Lấy danh sách các part đã upload xong
                const partsRes = await pool.query(
                    `SELECT part_number FROM upload_parts WHERE upload_session_id = $1`,
                    [session.id]
                );
                const uploadedParts = partsRes.rows.map(row => row.part_number);

                return res.status(200).json({
                    sessionId: session.id,
                    uploadId: session.s3_upload_id,
                    s3Key: session.s3_key,
                    chunkSize: session.chunk_size,
                    totalParts: totalParts,
                    uploadedParts: uploadedParts,
                    message: "Resume upload"
                });
            }



            // Nếu không có session pending nào -> Tạo mới hoàn toàn
            const multipartResult = await createMultipartUpload({
                key: s3Key,
                contentType: mimeType,
                metadata: {
                    ownerId: String(userId)
                }
            });

            const { uploadId } = multipartResult;

            const result = await pool.query(
                `INSERT INTO upload_sessions (owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id `,
                [userId, null, filename, uploadId, s3Key, chunkSize, 'pending', expiresAt]
            );
            const session = result.rows[0];

            const existFile = await pool.query(
                `SELECT * FROM files 
                WHERE owner_id = $1 AND name = $2 AND mime_type = $3 AND deleted_at = $4 `,
                [userId, filename, mimeType, null]
            )
            if (existFile.rows.length > 0) {
                const file = existFile.rows[0];
                await pool.query(
                    `UPDATE upload_sessions
                    SET file_id = $1
                    WHERE id = $2`,
                    [file.id, session.id]
                );
                return res.status(201).json({
                    sessionId: session.id,
                    uploadId: uploadId,
                    s3Key: s3Key,
                    chunkSize: chunkSize,
                    totalParts: totalParts,
                    expiresAt: expiresAt,
                    message: "Tạo session upload mới thành công!"
                });
            }
            else {


                return res.status(201).json({
                    sessionId: session.id,
                    uploadId: uploadId,
                    s3Key: s3Key,
                    chunkSize: chunkSize,
                    totalParts: totalParts,
                    expiresAt: expiresAt,
                    message: "Tạo session upload mới thành công!"
                });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },


    getUploadPartUrl: async (req, res) => {
        const userId = req.user.userID
        const { sessionId, partNumber } = req.body;
        console.log({ sessionId, partNumber })
        try {


            const result = await pool.query(
                `SELECT * FROM upload_sessions WHERE id = $1`,
                [sessionId]
            );
            const session = result.rows[0];
            if (!session) {
                return res.status(404).json({
                    message: "Khong co session hop le"
                });
            }
            else if (session.owner_id != userId) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap"
                });
            }
            else if (session.status !== "pending") {
                return res.status(400).json({
                    message: " session không còn pending "
                });

            }
            else if (new Date(session.expires_at) < new Date()) {
                return res.status(400).json({
                    message: "session đã hết hạn"
                })
            }
            const resultURL = await getPartPresignedUrl({
                key: session.s3_key,
                uploadId: session.s3_upload_id,
                partNumber: partNumber
            })
            return res.status(200).json({
                sessionId: sessionId,
                partNumber: partNumber,
                uploadUrl: resultURL.uploadUrl
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Bad Server"
            });
        }


    },


    confirmUploadPart: async (req, res) => {
        const { sessionId, partNumber, etag, sizeBytes } = req.body;
        const userId = req.user.userID;
        try {
            const sessionResult = await pool.query(
                `SELECT * FROM upload_sessions WHERE id = $1`,
                [sessionId]
            );
            const session = sessionResult.rows[0];

            if (!session) {
                return res.status(404).json({
                    message: "Khong co session hop le"
                });
            }
            else if (session.owner_id != userId) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap"
                });
            }
            else if (session.status !== "pending") {
                return res.status(400).json({
                    message: " session không còn pending "
                });

            }
            else if (new Date(session.expires_at) < new Date()) {
                return res.status(400).json({
                    message: "session đã hết hạn"
                })
            }
            const result = await pool.query(
                `INSERT INTO upload_parts (upload_session_id, part_number, etag, size_bytes)
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (upload_session_id, part_number)
                DO UPDATE SET
                    etag = EXCLUDED.etag,
                    size_bytes = EXCLUDED.size_bytes
                RETURNING * `,
                [sessionId, partNumber, etag, sizeBytes]
            );

            return res.status(200).json({
                success: true,
                sessionId: sessionId,
                partNumber: partNumber,
                message: 'Đã upload thanh cong'
            });


        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Bad Server"
            });
        }



    },




    completeMultipartUpload: async (req, res) => {
        const { sessionId } = req.body;
        const userId = req.user.userID;

        try {
            const sessionResult = await pool.query(
                `SELECT * FROM upload_sessions WHERE id = $1`,
                [sessionId]
            );

            const session = sessionResult.rows[0];
            if (!session) {
                return res.status(404).json({
                    message: "Khong co session hop le"
                });
            }
            else if (session.owner_id != userId) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap"
                });
            }
            else if (session.status !== "pending") {
                return res.status(400).json({
                    message: " session không còn pending "
                });

            }
            else if (new Date(session.expires_at) < new Date()) {
                return res.status(400).json({
                    message: "session đã hết hạn"
                })
            }

            const partResult = await pool.query(
                `SELECT part_number, etag
                FROM upload_parts
                WHERE upload_session_id = $1
                ORDER BY part_number ASC`,
                [sessionId]
            );

            const parts = partResult.rows;

            if (parts.length == 0) {
                return res.status(400).json({
                    message: "Chua co part nao de complete"
                })
            }

            const formatPart = parts.map((part) => ({
                PartNumber: part.part_number,
                ETag: part.etag
            }));

            const completeResult = await completeUpload({
                key: session.s3_key,
                uploadId: session.s3_upload_id,
                parts: formatPart
            })

            // Query để lấy total size
            const sizeResult = await pool.query(
                `SELECT COALESCE(SUM(size_bytes), 0) AS total_size
                FROM upload_parts
                WHERE upload_session_id = $1`,
                [sessionId]
            );

            const totalSize = sizeResult.rows[0].total_size

            if (session.file_id) {
                const existFileResult = await pool.query(
                    `SELECT id, owner_id, deleted_at
                    FROM files
                    WHERE id = $1`,
                    [session.file_id]
                );
                const existFile = existFileResult.rows[0];

                //if (existFile.)


                if (existFile.owner_id !== userId) {
                    return res.status(403).json({
                        message: "Ban khong co quyen upload file nay"
                    })
                }
                if (existFile.deleted_at) {
                    return res.status(403).json({
                        message: "file nay da bi xoa"
                    })
                }
                const versionResult = await pool.query(
                    `SELECT COALESCE(MAX(version_no), 0) AS max_version
                    FROM file_versions
                    WHERE file_id = $1`,
                    [session.file_id]
                );
                const maxVersion = versionResult.rows[0].max_version;
                const nextVersion = Number(maxVersion) + 1;
                await pool.query(
                    `INSERT INTO file_versions (file_id, version_no, s3_key, size_bytes, etag)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [session.file_id, nextVersion, session.s3_key, totalSize, completeResult.etag]
                );

                // Giới hạn 5 versions
                const countResult = await pool.query(
                    `SELECT COUNT(*) as total FROM file_versions WHERE file_id = $1`,
                    [session.file_id]
                );
                const total = parseInt(countResult.rows[0].total);

                if (total > 5) {
                    const oldestResult = await pool.query(
                        `SELECT id, s3_key FROM file_versions
                        WHERE file_id = $1
                        ORDER BY version_no ASC
                        LIMIT 1`,
                        [session.file_id]
                    );
                    const oldest = oldestResult.rows[0];

                    await deleteObject(oldest.s3_key);

                    await pool.query(
                        `DELETE FROM file_versions WHERE id = $1`,
                        [oldest.id]
                    );
                }

                await pool.query(
                    `UPDATE upload_sessions
                    SET status = $1
                    WHERE id = $2`,
                    ["completed", sessionId]
                );

                return res.status(200).json({
                    success: true,
                    sessionId: sessionId,
                    fileId: session.file_id,
                    versionNo: nextVersion,
                    message: "Versioning upload completed"
                });

            }
            else {
                const fileResult = await pool.query(
                    `INSERT INTO files (owner_id, name, mime_type)
                VALUES ($1, $2, $3)
                RETURNING id`,
                    [session.owner_id, session.filename, null]
                );

                const fileId = fileResult.rows[0].id;

                await pool.query(
                    `INSERT INTO file_versions (file_id, version_no, s3_key, size_bytes, etag)
                VALUES ($1, $2, $3, $4, $5)`,
                    [fileId, 1, session.s3_key, totalSize, completeResult.etag]
                );

            }


            await pool.query(
                `UPDATE upload_sessions
                SET status = $1 
                WHERE id = $2`,
                ["completed", sessionId]
            );





            return res.status(200).json({
                success: true,
                sessionId: sessionId,
                message: "Multipart upload completed"
            });





        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Bad Server"
            });
        }

    },


    GetPresignedDownloadURL: async (req, res) => {
        const fileId = req.params.id;
        const userId = req.user.userID;
        try {

            const result = await pool.query(
                `SELECT f.id, f.owner_id, f.name, fv.s3_key
                FROM files as f
                JOIN file_versions as fv ON fv.file_id = f.id
                WHERE f.id = $1 AND f.deleted_at IS NULL
                ORDER BY fv.version_no DESC
                LIMIT 1`,
                [fileId]
            );

            const file = result.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }

            if (file.owner_id !== userId) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            const { downloadURL } = await GetDownloadURL({ key: file.s3_key })

            return res.status(200).json({
                fileId: file.id,
                downloadURL: downloadURL
            });




        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    getUploadSessionStatus: async (req, res) => {
        const { sessionId } = req.params;
        const userId = req.user.userID;

        try {
            const sessionResult = await pool.query(
                `SELECT * FROM upload_sessions WHERE id = $1`,
                [sessionId]
            );
            const session = sessionResult.rows[0];

            if (!session)
                return res.status(404).json({ message: "Không tìm thấy session" });
            if (session.owner_id !== userId)
                return res.status(403).json({ message: "Không có quyền" });

            const partsResult = await pool.query(
                `SELECT part_number, size_bytes FROM upload_parts 
                WHERE upload_session_id = $1 ORDER BY part_number ASC`,
                [sessionId]
            );

            return res.status(200).json({
                sessionId: session.id,
                status: session.status,
                fileID: session.file_id,
                filename: session.filename,
                uploadedParts: partsResult.rows.map(r => r.part_number),
                chunkSize: session.chunk_size,
                expiresAt: session.expires_at
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    },

    abortMultipartUpload: async (req, res) => {
        const { sessionId } = req.body;
        const userId = req.user.userID;

        try {
            const sessionResult = await pool.query(
                `SELECT * FROM upload_sessions WHERE id = $1`,
                [sessionId]
            );
            const session = sessionResult.rows[0];

            if (!session)
                return res.status(404).json({ message: "Không tìm thấy session" });
            if (session.owner_id !== userId)
                return res.status(403).json({ message: "Không có quyền" });
            if (session.status !== 'pending')
                return res.status(400).json({ message: "Session không ở trạng thái pending" });

            await abortUpload({ key: session.s3_key, uploadId: session.s3_upload_id });

            await pool.query(
                `UPDATE upload_sessions SET status = 'aborted' WHERE id = $1`,
                [sessionId]
            );

            return res.status(200).json({ message: "Đã hủy upload" });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

};

export default fileController;
