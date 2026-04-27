import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from "../db";

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
            if (!email)
            {
                return res.status(400).json({message: 'Tài khoản không hợp lệ'});
            }
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            const accessToken = jwt.sign(
                {userID: user.id},
                process.env.JWT_SECRET,
                {expiresIn: '15m'}
            );
            const refreshToken = jwt.sign(
                {userID: user.id},
                process.env.JWT_SECRET,
                {expiresIn: '7d'}
            );

            await pool.query(
                "update users set refresh_token = $1 where id = $2",
                [refreshToken, user.id]
            );
            res.json({accessToken, refreshToken});
        }
        catch (err)
        {
            console.log('Error', err);
            res.status(500).json({message: 'Lỗi Server'});
        }
    },

    
}