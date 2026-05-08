import pool from "../db.js";
import { createMultipartUpload } from "../s3.js";

const fileController = {
  initMultipartUpload: async (req, res) => {
    const { filename, mimeType, sizeBytes, fileId } = req.body; 
    const userId = req.user.userID;
    const chunkSize = 5 * 1024 * 1024;
    const totalParts = Math.ceil(sizeBytes / chunkSize);
    const uniquePart = timestamp();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const s3Key = `users/${userId}/files/${uniquePart}-${filename}`;
    try {
        const multipartResult = await createMultipartUpload({
            key: s3Key,
            contentType: mimeType,
            metadata: {
                ownerId: String(userId)
            }
        });

        const  uploadId  = multipartResult;
        const result = await pool.query(
            `INSERT INTO upload_sessions (owner_id, file_id, filename, s3_upload_id, s3_key, chunk_size, status, expires_at )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id `,
            [userId , fileId, filename, uploadId , s3Key , chunkSize, 201, expiresAt ]
        );

        const session = result.rows[0];
        return res.status(201).json({
            sessionId: session.id,
            uploadId: uploadId,
            s3Key: s3Key,
            chunkSize: chunkSize,
            totalParts: totalParts,
            expiresAt: expiresAt,
        });


    } catch (err){
        res.status(500).send("Bad Server")
    }
  },
};

export default fileController;
