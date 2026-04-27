import jwt from "jsonwebtoken";
import "dotenv/config";
const middlewareAuth = (req, res, next) =>
{
    const authHeader = req.headers.authorization;

    if(!authHeader) 
    {
        return res.status(401).json
        ({
            message: "Empty token!"
        });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);
    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
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