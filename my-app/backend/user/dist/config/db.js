"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    const url = process.env.DB_URL;
    if (!url) {
        console.error("Cannot find DB_URL in environment variables");
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(url, {
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
exports.default = connectDB;
