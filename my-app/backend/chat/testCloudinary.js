// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";
// import fs from "fs";

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// async function testUploadLocal() {
//   try {
//     // Read a local image
//     const fileBuffer = fs.readFileSync("./test.png"); // put a small test image in this folder

//     const result = await cloudinary.uploader.upload(
//       `data:image/png;base64,${fileBuffer.toString("base64")}`,
//       {
//         folder: "chat-images",
//         transformation: [
//           { width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" },
//         ],
//       }
//     );

//     console.log("Upload successful!");
//     console.log("Image URL:", result.secure_url);
//   } catch (err) {
//     console.error("Cloudinary upload error:", err);
//   }
// }

// testUploadLocal();
