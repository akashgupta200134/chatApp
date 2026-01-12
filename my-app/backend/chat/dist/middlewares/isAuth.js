import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Please login - no auth header found" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // ✅ Validate required fields
        if (!decoded || !decoded._id) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        // ✅ Attach user to request
        req.user = {
            _id: decoded._id,
            email: decoded.email,
            name: decoded.name,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Please login - JWT error (chat middleware)",
        });
    }
};
export default isAuth;
