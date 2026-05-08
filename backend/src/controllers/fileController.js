import pool from "../db.js";
import {createMultipartUpload, getPartPresignedUrl} from "../s3.js";


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
            [userId , fileId, filename, uploadId , s3Key , chunkSize, 'pending' , expiresAt ]
        );

        const session = result.rows[0];
        return res.status(201).json({
            sessionId: session.id,
            uploadId: uploadId,
            s3Key: s3Key,
            chunkSize: chunkSize,
            totalParts: totalParts,
            expiresAt: expiresAt,
            message: "Tải file lên thành công!"
        });


    } catch (err){
        return res.status(500).json({
            message: "Bad Server"
        });
    }
  },
  getUploadPartUrl: async (req, res) => {
    const userId = req.user.userID
    const { sessionId , partNumber } = req.body;
    console.log ( { sessionId , partNumber })
    try {


        const result = await pool.query(
            `SELECT * FROM upload_sessions WHERE id = $1`,
            [sessionId]
        );
        const session = result.rows[0];
        if (!session){
            return res.status(404).json({
                message: "Khong co session hop le"
            });
        }
        else if (session.owner_id != userId){
            return res.status(403).json({
                message: "Khong co quyen truy cap"
            });
        }
        else if (session.status !== "pending"){
            return res.status(400).json({
                message:" session không còn pending "
            });

        }
        else if (new Date(session.expires_at ) < new Date()){
            return res.status(400).json({
                message:"session đã hết hạn"
            })
        }
        const resultURL = await getPartPresignedUrl ({
            key: session.s3_key,
            uploadId: session.s3_upload_id,
            partNumber: partNumber
        })
        return res.status(200).json({
            sessionId: sessionId,
            partNumber: partNumber,
            uploadUrl: resultURL.uploadUrl
        })

    } catch(err){
        return res.status(500).json({
            message: "Bad Server"
        });
    }
    



  },


  confirmUploadPart: async (req, res) => {
    const {sessionId , partNumber, etag, sizeBytes} = req.body;
    const userId = req.user.userID;
    try{
const sessionResult = await pool.query(
            `SELECT * FROM upload_sessions WHERE id = $1`,
            [sessionId]
        );
        const session = sessionResult.rows[0];

        if (!session){
            return res.status(404).json({
                message: "Khong co session hop le"
            });
        }
        else if (session.owner_id != userId){
            return res.status(403).json({
                message: "Khong co quyen truy cap"
            });
        }
        else if (session.status !== "pending"){
            return res.status(400).json({
                message:" session không còn pending "
            });

        }
        else if (new Date(session.expires_at ) < new Date()){
            return res.status(400).json({
                message:"session đã hết hạn"
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
            [sessionId , partNumber, etag, sizeBytes]
        );
         
        return res.status(200).json({
            success : true,
            sessionId: sessionId,
            partNumber: partNumber,
            message : 'Đã upload thanh cong'
        });


    } catch (err){
        console.log(err)
        return res.status(500).json({
            message: "Bad Server"
        });
    }



  },
  getUploadSessionStatus: async (req, res) => {
    return res.status(501).json({
      message: "completeMultipartUpload chưa được implement"
    });
  },



  completeMultipartUpload: async (req, res) => {
    const {sessionId} = req.body;
    const userId = req.user.userID;

    try {
        const sessionResult = await pool.querry(
            `SELECT * FROM upload_sessions WHERE id = $1`,
            [sessionId]
        );

        const session = sessionResult.rows[0];
        if (!session){
            return res.status(404).json({
                message: "Khong co session hop le"
            });
        }
        else if (session.owner_id != userId){
            return res.status(403).json({
                message: "Khong co quyen truy cap"
            });
        }
        else if (session.status !== "pending"){
            return res.status(400).json({
                message:" session không còn pending "
            });

        }
        else if (new Date(session.expires_at ) < new Date()){
            return res.status(400).json({
                message:"session đã hết hạn"
            })
        }

        const partResult = await pool.querry(
            `SELECT part_number, etag
            FROM upload_parts
            WHERE upload_session_id = $1
            ORDER BY part_number ASC`
            [sessionId]
        );

        const parts = partResult.rows;

        if(partResult.length == 0){
            return res.status(400).json({
                message: "Chua co part nao de complete"
            })
        }

        const formatPart = parts.map((part)=>({
            PartNumber: part.part_number,
            Etag: part.etag
        }));





        
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Bad Server"
        });
    }

  },







  abortMultipartUpload: async (req, res) => {
    return res.status(501).json({
      message: "abortMultipartUpload chưa được implement"
    });
  },
};

export default fileController;
