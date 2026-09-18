import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDB } from "../src/config/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();

    return app(req, res);
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
}
