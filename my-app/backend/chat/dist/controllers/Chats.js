import TryCatch from "../config/Trycatch.js";
import { Chat } from "../model/chat.js";
import mongoose from "mongoose";
import { Message } from "../model/messages.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export const createNewChat = TryCatch(async (req, res) => {
    // Ensure authenticated
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { otheruserId } = req.body;
    if (!otheruserId) {
        return res.status(400).json({ message: "otheruserId is required" });
    }
    // Prevent self-chat
    if (otheruserId === req.user._id.toString()) {
        return res.status(400).json({ message: "Cannot create chat with yourself" });
    }
    const otherUserObjectId = new mongoose.Types.ObjectId(otheruserId);
    // Check existing 1-1 chat
    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserObjectId], $size: 2 },
    });
    if (existingChat) {
        return res.json({
            message: "Chat already exists",
            chatId: existingChat._id,
        });
    }
    // Create new chat
    const newChat = await Chat.create({
        users: [userId, otherUserObjectId],
    });
    res.status(201).json({
        message: "New chat created",
        chatId: newChat._id,
    });
});
export const getAllChats = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId)
        return res.status(401).json({ message: "User not authenticated" });
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Get chats involving the current user
    const chats = await Chat.find({ users: userObjectId })
        .sort({ updatedAt: -1 })
        .populate("latestMessage");
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        // Find the other user's ID
        const otherUserId = chat.users.find((id) => id.toString() !== userId);
        // Count unseen messages for this chat
        const unseenCount = await Message.countDocuments({
            chatId: chat._id,
            sender: { $ne: userObjectId },
            seen: false,
        });
        // Fetch other user's info
        let userInfo;
        if (!otherUserId) {
            // Self-chat or invalid chat
            userInfo = { _id: null, name: "Unknown User" };
        }
        else {
            try {
                const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`, { headers: { Authorization: req.headers.authorization } });
                userInfo = data; // raw user object from USER service
            }
            catch (err) {
                console.error("Failed to fetch user:", err.message);
                userInfo = { _id: otherUserId, name: "Unknown User" };
            }
        }
        return {
            user: userInfo,
            chat: {
                _id: chat._id,
                users: chat.users,
                latestMessage: chat.latestMessage || null,
                unseenCount,
                updatedAt: chat.updatedAt,
            },
        };
    }));
    res.json({ success: true, chats: chatWithUserData });
});
