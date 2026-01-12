import  jwt  from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

const jwtsecret = process.env.JWT_SECRET as string;

if (!jwtsecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};


