import { Server } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import { envVars } from "./config/env";
import { connectDB } from "./config/db";

dotenv.config();

const port = envVars.port || process.env.PORT || 5000;
const dbUri = process.env.MONGODB_URL;

let server: Server;

async function main() {
  try {
    if (dbUri) {
      await mongoose.connect(dbUri);
      console.log(
        "⚡ [database]: Connected to MongoDB Atlas via Mongoose successfully!",
      );
    } else {
      await connectDB();
    }

    server = app.listen(port, () => {
      console.log(
        `🚀 [server]: Server is running on port http://localhost:${port}`,
      );
    });

    const shutdown = async () => {
      console.log("Shutting down server...");
      await mongoose.disconnect();
      if (server) {
        server.close(() => {
          console.log("HTTP server closed.");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected Error in main execution:", err);
  process.exit(1);
});
