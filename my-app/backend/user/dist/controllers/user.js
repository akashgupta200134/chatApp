import { redisClient } from "../config/redis.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/Trycatch.js";
import { User } from "../model/User.js";
import { generateToken } from "../config/generateToken.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const ratelimit = await redisClient.get(rateLimitKey);
    if (ratelimit) {
        res.status(429).json({
            message: "To many request,please wait for sometime and try again"
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 300
    });
    await redisClient.set(rateLimitKey, "true", {
        EX: 60,
    });
    const message = {
        to: email,
        subject: "Your otp code: ",
        body: `Your otp Code is ${otp}, It is only valid for 5 minutes`
    };
    await publishToQueue("send-otp", message);
    res.status(200).json({
        message: "OTP sent to your email",
    });
});
export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "Email and Otp are required"
        });
        return;
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== enteredOtp) {
        res.status(400).json({
            message: "invalid otp or expired otp"
        });
        return;
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.slice(0, 10);
        user = await User.create({ name, email });
    }
    const token = generateToken(user);
    res.status(200).json({
        message: "User verified",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    });
});
export const getprofile = TryCatch(async (req, res) => {
    const user = req.user;
    res.status(200).json({
        _id: req.user?._id,
        name: req.user?.name,
        email: req.user?.email,
    });
});
export const updateName = TryCatch(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { name }, { new: true }).select("_id name email");
    if (!user) {
        return res.status(404).json({
            message: "User not found, please login",
        });
    }
    const token = generateToken(user);
    res.status(200).json({
        message: "User Updated",
        user,
        token,
    });
});
export const getAllUsers = TryCatch(async (req, res) => {
    const allUsers = await User.find().select("_id name email");
    res.status(200).json(allUsers);
});
export const OneUser = TryCatch(async (req, res) => {
    const singleUser = await User.findById(req.params.id)
        .select("_id name email");
    if (!singleUser) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(singleUser);
});
