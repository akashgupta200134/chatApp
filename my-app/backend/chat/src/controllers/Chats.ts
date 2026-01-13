import TryCatch from "../config/Trycatch.js";
import isAuth, { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../model/chat.js";
import mongoose from "mongoose";
import { Message } from "../model/messages.js";
import axios from "axios";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/cloudinaryupload.js";

dotenv.config();

export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
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

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "User not authenticated" });

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get chats involving the current user
  const chats = await Chat.find({ users: userObjectId })
    .sort({ updatedAt: -1 })
    .populate("latestMessage");

 const chatWithUserData = await Promise.all(
  chats.map(async (chat) => {
    // Find the other user's ID
    const otherUserId = chat.users.find(
      (id: mongoose.Types.ObjectId) => id.toString() !== userId
    );


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
      } else {
        try {
          const { data } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
            { headers: { Authorization: req.headers.authorization } }
          );
          userInfo = data; // raw user object from USER service
        } catch (err: any) {
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
    })
  );

  res.json({ success: true, chats: chatWithUserData });
});





export const SendMessages = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    if (!text && !imageFile) {
      return res
        .status(400)
        .json({ message: "Either text or image is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === senderId.toString()
    );

    if (!isUserInChat) {
      return res
        .status(403)
        .json({ message: "You are not a member of this chat" });
    }


    const messageData: any = {
      chatId,
      sender: senderId,
      seen: false,
      messageType: "text",
    };

    if (imageFile) {
      const uploadResult = await uploadToCloudinary(imageFile);

      messageData.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };

      messageData.messageType = "image";
      messageData.text = text || "";
    } else {
      messageData.text = text;
    }

    const message = new Message(messageData);
    const savedMessage = await message.save();

    const latestMessageText = imageFile ? "📷 Image" : text;

    await Chat.findByIdAndUpdate(
      chatId,
      {
        latestMessage: {
          text: latestMessageText,
          sender: senderId,
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).json({
      message: savedMessage,
      sender: senderId,
    });
  }
);



 export const  getMessagesByChat = TryCatch(async(req:AuthenticatedRequest , res) =>{
  const userId = req.user?._id;
  const {chatId} = req.params;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

      if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findById(chatId);


      if(!chat) {
      return res.status(404).json({ message: "chat not found" });
    }

     const isUserInChat = chat.users.some(
      (userId) => userId.toString() === userId.toString()
    );

       if (!isUserInChat) {
      return res
        .status(403)
        .json({ message: "You are not a member of this chat" });
    }

    const messagestoMarkseen = await Message.find({
      chatId: chatId,
      sender : {$ne:userId},
      seen:false,
    })
    
     await Message.updateMany({
      chatId: chatId,
      sender : {$ne:userId},
      seen:false,
     },{
      seen : true,
      seenAt : new Date()
     }
    )


    const messages = await Message.find({chatId}).sort({
      createdAt : 1});


const otherUserId = chat.users.find(
  (id) => id.toString() !== userId
);   


     try {
          const { data } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
            );

          if (!otherUserId) {
            return res.status(400).json({ message: "Not other user" });
          }

          // socket work



          
          res.json({
            messages,
            user:data,
          })
   
        } catch (err: any) {
          console.error("Failed to fetch user:", err.message);
            res.json({
            messages,
            user:{_id : otherUserId , name : "Unknown User"},
          })
      
        }




 })