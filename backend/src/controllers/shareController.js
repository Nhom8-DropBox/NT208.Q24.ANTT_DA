import pool from '../db.js';
import { GetDownloadURL } from '../s3.js';

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
                "insert into share_links (file_id, token_uuid, permission, expires_at) values ($1, $2, $3, $4)",
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
    getPublicShare: async (req, res) => {
        const { token } = req.params;

        try {
            const result = await pool.query(
                `SELECT sl.*, f.name as file_name,
                        fv.s3_key, fv.size_bytes, fv.version_no
                FROM share_links sl
                JOIN files f ON sl.file_id = f.id
                JOIN file_versions fv ON fv.file_id = f.id
                WHERE sl.token_uuid = $1
                AND fv.version_no = (
                    CASE 
                        WHEN sl.version_id IS NULL 
                        THEN (SELECT MAX(version_no) FROM file_versions WHERE file_id = f.id)
                        ELSE (SELECT version_no FROM file_versions WHERE id = sl.version_id)
                    END
                )`,
                [token]
            );

            if (result.rows.length === 0)
                return res.status(404).json({ message: "Link không tồn tại" });

            const share = result.rows[0];

            if (share.revoked_at)
                return res.status(410).json({ message: "Link đã bị thu hồi" });

            if (share.expires_at && new Date(share.expires_at) < new Date())
                return res.status(410).json({ message: "Link đã hết hạn" });

            let downloadUrl = null;
            if (share.permission === 'download') {
                const { downloadURL } = await GetDownloadURL({ key: share.s3_key });
                downloadUrl = downloadURL;
            }

            return res.status(200).json({
                fileName: share.file_name,
                size: share.size_bytes,
                permission: share.permission,
                downloadUrl
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    },
}

export default shareController;
