import { Schema, model, Document } from "mongoose";

// 🎯 ১. ChatMessageType Union টাইপ ডিফাইন করুন
export type ChatMessageType = "TEXT" | "PRODUCT_LIST" | "ORDER_STATUS";

export interface IChatMessage {
  userId: string;
  sender: "user" | "bot";
  message: string;
  type?: ChatMessageType; // 👈 সাধারণ string-এর বদলে Union Type ব্যবহার করুন
  data?: any;
  createdAt?: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: String, required: true, index: true },
    sender: { type: String, enum: ["user", "bot"], required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["TEXT", "PRODUCT_LIST", "ORDER_STATUS"],
      default: "TEXT",
    },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const ChatMessage = model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema,
);
