import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
    const url = process.env.DB_URL;
    if (!url) {
        console.error("Cannot find DB_URL in environment variables");
        process.exit(1);
    }
    try {
        await mongoose.connect(url, {
            dbName: "chatapplication",
        });
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Something went wrong during database connection");
        console.error(error);
        process.exit(1);
    }
};
export default connectDB;
