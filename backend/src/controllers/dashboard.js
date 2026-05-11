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
                "select email from users where id = $1",
                [userID]
            );

            const sumStorage = await pool.query( // đoạn này t test
                "select sum(fv.size_bytes) as total_storage from files f join users u on f.owner_id = u.id join file_versions fv on f.id = fv.file_id where u.id = $1 and f.deleted_at is NULL",
                [userID]
            );
            res.json({ user: result.rows[0], total_storage: sumStorage.rows[0].total_storage });
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    }
};

export default dashboard;