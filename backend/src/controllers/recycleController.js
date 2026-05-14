import pool from "../db.js";
import { GetDownloadURL, deleteObject } from "../s3.js";


const recycleController = {
    restore: async (req, res) => {
        const fileId = req.params.id;
        const userId = req.user.userID;
        try {
            const result = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileId]
            );

            const file = result.rows[0];

            await pool.query(
                `UPDATE files
                SET deleted_at = NULL
                WHERE id = $1`,
                [fileId]
            );

            if (!file) 
                return res.status(404).json({ message: "Khong tim thay file" });
            if (file.owner_id !== userId)
                return res.status(403).json({ message: "Khong co quyen khoi phuc file" });
            if (!file.deleted_at) 
                return res.status(400).json({ message: "File nay khong nam trong thung rac" });

            return res.status(200).json({
                success: true,
                fileId: fileId,
                message: "Khoi phuc file thanh cong"
            });


        } catch (err) {
            console.log(err);
            return res.status(500).json({
            message: "Bad Server"
            })
        

        }
    }

};

export default recycleController;
