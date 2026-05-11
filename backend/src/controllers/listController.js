import pool from "../db.js";
import { completeUpload, createMultipartUpload, getPartPresignedUrl, GetDownloadURL } from "../s3.js";


const listController = {
    getFiles: async (req, res ) => {
        const userID = req.user.userID;

        try {
            const result = await pool.query(
                `SELECT f.id, f.name, f.mime_type, f.created_at, f.updated_at
                FROM files AS f 
                WHERE f.owner_id = $1 AND f.deleted_at IS NULL
                ORDER BY f.created_at DESC`,
                [userID]
            );

            return res.status(200).json({
                files: result.rows
            });
        


        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    getFileById: async (req , res) =>{
        const fileId = req.params.id;
        const userID = req.user.userID; 
        try {
            const result = await pool.query(
                `SELECT f.id, f.owner_id, f.name, f.mime_type, f.created_at, f.updated_at, fv.size_bytes
                FROM files f
                JOIN file_versions fv ON fv.file_id = f.id
                WHERE f.id = $1 AND f.deleted_at IS NULL
                ORDER BY fv.version_no DESC`,
                [fileId]
            );
            const file = result.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }
            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            return res.status(200).json({
                file: file
            });



            
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }

    },

    deleteFile: async (req, res)=>{

        const fileId = req.params.id;
        const userID = req.user.userID;

        try {
           const result = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileId]
            );
            
            const file = result.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }
            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen xoa file"
                });
            }

            if (file.deleted_at) {
            return res.status(400).json({
                message: "File da bi xoa truoc do"
            });
            }
            
            await pool.query(
                `UPDATE files
                SET deleted_at = NOW()
                WHERE id = $1`,
                [fileId]
            );

            return res.status(200).json({
                success: true,
                fileId: fileId,
                message: "Da xoa file"
            });


        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
        

    },


    getFileVersions: async (req, res) => {
        const fileID = req.params.id;
        const userID = req.user.userID;

        try {
            const fileResult = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileID]
            );

            const file = fileResult.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }

            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            if (file.deleted_at) {
                return res.status(400).json({
                    message: "File da bi xoa"
                });
            }

            const versionResult = await pool.query(
                `SELECT id, version_no, size_bytes, etag, created_at
                FROM file_versions
                WHERE file_id = $1
                ORDER BY version_no DESC`,
                [fileID]
            );

            const versions = versionResult.rows ;


            const maxVersion = versions[0].version_no;

            const formattedVersions = versions.map((row) => ({
                id: row.id,
                versionNo: row.version_no,
                sizeBytes: row.size_bytes,
                etag: row.etag,
                createdAt: row.created_at,
                isCurrent: row.version_no === maxVersion,
                isOriginal: row.version_no === 1
            }));



            return res.status(200).json({
                fileId: fileID,
                versions: formattedVersions
            });

            

            
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    getVersionDownloadUrl: async (req, res) => {
        const fileId = req.params.id;
        const versionNo = req.params.versionNo;
        const userId = req.user.userID;

        try {
            const fileResult = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileId]
            );

            const file = fileResult.rows[0];

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

            if (file.deleted_at) {
                return res.status(400).json({
                    message: "File da bi xoa"
                });
            }

            const versionResult = await pool.query(
                `SELECT id, file_id, version_no, s3_key, size_bytes, etag, created_at
                FROM file_versions
                WHERE file_id = $1 AND version_no = $2`,
                [fileId, versionNo]
            );

            const version = versionResult.rows[0];


            if (!version) {
                return res.status(404).json({
                    message: "Khong tim thay version"
                });
            }

            const { downloadURL } = await GetDownloadURL({
                key: version.s3_key
            });
            
            return res.status(200).json({
                fileId: fileId,
                versionId: version.id,
                versionNo: version.version_no,
                downloadURL: downloadURL
            });




            
        } catch (err) {
           console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    }




};

export default listController;
