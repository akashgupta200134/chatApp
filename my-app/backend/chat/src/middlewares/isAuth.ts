import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Please login - no auth header found" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // ✅ Validate required fields
    if (!decoded || !decoded._id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // ✅ Attach user to request
    req.user = {
      _id: decoded._id as string,
      email: decoded.email as string,
      name: decoded.name as string,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Please login - JWT error (chat middleware)",
    });
  }
};

export default isAuth;
