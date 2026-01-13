import cloudinary from "./config/cloudinary.js";
const testUpload = async () => {
    try {
        const result = await cloudinary.uploader.upload("https://via.placeholder.com/150");
        console.log("Upload success:", result.secure_url);
    }
    catch (err) {
        console.error("Cloudinary error:", err);
    }
};
testUpload();
