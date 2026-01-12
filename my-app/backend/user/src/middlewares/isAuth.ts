import { NextFunction, Request, Response } from "express";
import { IUser } from "../model/User.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please login - no auth header found",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded || !decoded._id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
      req.user = {
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name,
    } as IUser;
    next();
  } catch (error) {
    console.log("please login - Jwt Error", error);
  }
};
