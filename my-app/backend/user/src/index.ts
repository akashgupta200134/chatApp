import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import { connectRabbitmq } from "./config/rabbitmq.js";
import { connectRedis } from "./config/redis.js";
import cors from "cors"

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitmq();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
