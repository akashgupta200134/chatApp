// import { v2 as cloudinary } from "cloudinary";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  return await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder: "chat-images",
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    }
  );
};
