import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please login - no auth header found",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded._id) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.user = {
            _id: decoded._id,
            email: decoded.email,
            name: decoded.name,
        };
        next();
    }
    catch (error) {
        console.log("please login - Jwt Error", error);
    }
};
