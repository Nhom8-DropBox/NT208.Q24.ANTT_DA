import pool from '../db.js';
import { GetPresignedDownloadURL } from '../s3.js';

const shareController = {
    createShareLink: async (req, res) => {
        const userID = req.user.userID;
        const {fileId, permission, expires_at} = req.body;
        try
        {
            const fileCheck = await pool.query(
                "select * from files where id = $1 and owner_id = $2 and deleted_at is NULL",
                [fileId, userID]
            );
            if (fileCheck.rows.length === 0)
            {
                return res.status(403).json({message: "File không tồn tại hoặc bạn không có quyền"})
            }

            const token = crypto.randomUUID();
            await pool.query(
                "insert into share_links (file_id, token_uuid, permission, values ($1, $2, $3, $4))",
                [fileId, token, permission || 'view', expires_at || null]
            );
            res.status(201).json({
                token,
                url: `http://localhost:3000/public/share/${token}`
            });
        }
        catch (err)
        {
            console.log(err);
            res.status(500).json({message: "Lỗi Server"});
        }
    },

    getShareLinks: async (req, res) =>
    {
        const userID = req.user.userID;
        try
        {
            const result = await pool.query(
                "select sl.*, f.name file_name from share_links sl join files f on sl.file_id = f.id where f.owner_id = $1 order by sl.created_at desc",
                [userID]
            );
            res.json(result.rows);
        }
        catch (err)
        {
            console.log(err);
            res.status(500).json({message: "Lỗi Server"});
        }
    },

    revokeShareLink: async (req, res) =>
    {
        const userID = req.user.userID;
        const id = req.params.id;
        try
        {
            const userCheck = pool.query(
                "select sl.id from share_links sl join files f on sl.file_id = f.id where sl.id = $1 and f.owner_id = $2",
                [id, userID]
            );
            if ((await userCheck).rows.length === 0)
            {
                res.status(403).json({message: "Không có quyền thu hồi links"});
            }
            await pool.query(
                "update share_links set remoke_at = NOW() where id = $1",
                [id]
            );
            res.json({message: "Đã thu hồi links thành công"});
        }   
        catch (err)
        {
            console.log(err);
            res.status(500).json({message: "Lỗi Server"});
        }
    },
}

export default shareController;