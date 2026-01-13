import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createNewChat, getAllChats, getMessagesByChat, SendMessages } from "../controllers/Chats.js";
import { upload } from "../middlewares/multer.js";
import multer from "multer";

const router = express.Router();

router.post("/chat/new" , isAuth , createNewChat);
router.get("/chat/all" , isAuth , getAllChats);
router.post(
  "/message",
  isAuth,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  SendMessages
);

router.get("/message/:chatId" , isAuth , getMessagesByChat)


export default router;
