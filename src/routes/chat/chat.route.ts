import express from "express";
import {
  getChatHistory,
  handleChatMessage,
} from "../../services/ai/chat/chat.controller";

const router = express.Router();

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: AI Chatbot Assistant Endpoint
 *     description: Processes user messages using AI to search products, track orders, answer FAQs, or handle general chat.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "500 takar t-shirt dekhao"
 *                 description: The text message sent by the user.
 *               userFrequentCategory:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 description: Optional MongoDB ObjectId for personalized sorting.
 *     responses:
 *       200:
 *         description: Successfully processed chat message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat response generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                       example: "আপনার অনুসন্ধানের ওপর ভিত্তি করে কিছু পছন্দের প্রোডাক্ট নিচে দেওয়া হলো:"
 *                     type:
 *                       type: string
 *                       enum: [PRODUCT_LIST, ORDER_STATUS, TEXT]
 *                       example: "PRODUCT_LIST"
 *                     data:
 *                       type: array
 *                       description: Returned items when type is PRODUCT_LIST or ORDER_STATUS
 *                       items:
 *                         type: object
 *       400:
 *         description: Bad Request (Missing required message field).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Message is required"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to process chat message"
 */
router.post("/", handleChatMessage);


router.get("/history/:userId", getChatHistory);
export const ChatRoutes = router;
