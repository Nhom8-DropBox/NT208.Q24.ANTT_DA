// file này nên thêm việc kiểm tra đầu vào dữ liệu đăng kí / đăng nhập ở đây
// tránh việc dùng ddos, brute-force hoặc sql injection

import jwt from "jsonwebtoken";
import "dotenv/config";

// cơ chế xác thực jwt mỗi khi client giao tiếp với server
const middlewareAuth = (req, res, next) =>
{
    const authHeader = req.headers.authorization;

    if(!authHeader) // không có token
    {
        return res.status(401).json
        ({
            message: "Empty token!"
        });
    }

    const token = authHeader.split(" ")[1];
    //console.log(token);
    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decoded);

        //req.user = decoded;

        next();
    }
    catch(err)
    {
        return res.status(403).json
        ({
            message: "Invalid token!"
        });
    }
};

export default middlewareAuth