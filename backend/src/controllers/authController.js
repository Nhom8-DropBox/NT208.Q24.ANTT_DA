import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from "../db.js";

const authController = {
    register: async (req, res) =>
    {
        const {user_email, password} = req.body;
        try {
            const email = await pool.query(
                "select * from users where email = $1", [user_email]
            );
            if (email.rows.length > 0)
            {
                return res.status(400).json({message: 'Email đã được sử dụng'});
            }
            const hashPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "insert into users (email, password_hash) values ($1, $2)",
                [user_email, hashPassword]
            )
            res.status(201).json({message: 'Đăng ký thành công'});
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    },

    login: async (req, res) =>
    {
        const {user_email, password} = req.body;
        try
        {
            const email = await pool.query(
                "select * from users where email = $1",
                [user_email]
            );
            const user = email.rows[0];
            if (!user)
            {
                return res.status(400).json({message: 'Tài khoản không hợp lệ'});
            }
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch)
            {
                return res.status(400).json({message: 'Mật khẩu không đúng'});
            }
            const accessToken = jwt.sign(
                {userID: user.id},
                process.env.JWT_SECRET,
                {expiresIn: '15m'}
            );
            //console.log(accessToken);
            const refreshToken = jwt.sign(
                {userID: user.id},
                process.env.JWT_SECRET,
                {expiresIn: '7d'}
            );
            //console.log(refreshToken);

            await pool.query(
                "update users set refresh_token = $1 where id = $2",
                [refreshToken, user.id]
            );
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true, // k cho phép js đọc
                secure: true, // chỉ truyền qua https
                sameSite: "Strict" // k cho phép các trang web khác gửi cookie
            });

            res.json({accessToken});
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    },

    refresh: async (req, res) =>
    {
        const {refreshToken} = req.body;
        if (!refreshToken) 
        {
            return res.status(400).json({message: 'No refresh token'});
        }
        try
        {
            const result = await pool.query(
                "select * from users where refresh_token = $1",
                [refreshToken]
            );
            if (result.rows.length === 0)
            {
                return res.status(401).json({message: 'Invalid refresh token'});
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            const accessToken = jwt.sign(
                {userID: decoded.userID},
                process.env.JWT_SECRET,
                {expiresIn: '15m'}
            );

            res.json({accessToken});
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    },

    logout: async (req, res) =>
    {
        const {refreshToken} = req.body;
        await pool.query(
            "update users set refresh_token = NULL where refresh_token = $1",
            [refreshToken]
        );

        res.json({message: 'Đăng xuất thành công'});
    },

    
}

export default authController;