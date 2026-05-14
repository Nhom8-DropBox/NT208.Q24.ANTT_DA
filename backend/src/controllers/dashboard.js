// control các luồng api từ dashboard
import pool from "../db.js"

const dashboard = {
    mainpage: async (req, res) => // test
    {
        res.json({progress: `10%`});// pull từ db vềm chuyển thành json và gửi xuống cho fe
    }, 

    getProfile: async (req, res) =>
    {
        const userID = req.user.userID;
        try
        {
            const result = await pool.query(
                "select email, storage_limit from users where id = $1",
                [userID]
            );

            const sumStorage = await pool.query( // đoạn này t test
                "select sum(fv.size_bytes) as total_storage from files f join users u on f.owner_id = u.id join file_versions fv on f.id = fv.file_id where u.id = $1 and f.deleted_at is NULL",
                [userID]
            );
            res.json({ user: result.rows[0], total_storage: sumStorage.rows[0].total_storage, storage_limit: result.rows[0].storage_limit });
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    },

    Upgrade_limited: async (req, res) =>
    {
        const {code} = req.body;
        const userID = req.user.userID;
        try
        {
            const result = await pool.query(
                "select * from promo_codes where code = $1 and used_by is null",
                [code]
            );
            if (result.rows.length === 0)
            {
                return res.status(401).json({message: "Mã code không hợp lệ"});
            }
            const promo = result.rows[0];
            await pool.query(
                "update users set storage_limit = $1 where id = $2",
                [promo.storage_bytes, userID]
            );
            await pool.query(
                "update promo_codes set used_by = $1 where id = $2",
                [userID, promo.id]
            )
            return res.json({ storage_limit: promo.storage_bytes });
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    }
};

export default dashboard;