import pool from "../db.js";

const listController = {
    getFiles: async (req, res ) => {
        const userID = req.user.userID;

        try {
            const result = await pool.query(
                `SELECT f.id, f.name, f.mime_type, f.created_at, f.updated_at, fv.size_bytes 
                FROM files AS f 
                JOIN file_versions fv ON fv.file_id = f.id
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
                WHERE f.id = $1 AND f.deleted_at IS NULL`,
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

    deleteFile: async (res, req)=>{

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
        

    }


};

export default listController;
