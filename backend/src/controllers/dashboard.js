// control các luồng api từ dashboard
import pool from "../db.js"

const dashboard = {
    mainpage: async (req, res) =>
    {
        res.json({progress: `10%`});
    }
};

export default dashboard;