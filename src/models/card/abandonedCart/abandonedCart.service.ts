import { Types } from "mongoose";
import { AbandonedCart } from "./abandonedCart.model";

// 🎯 ১. চেকআউট পেজ থেকে ডাটা অটো-সেভ করা
export const trackAbandonedCartService = async (payload: {
  userId?: string;
  email?: string;
  phone?: string;
  name?: string;
  items: any[];
  totalAmount: number;
}) => {
  const { userId, email, phone, name, items, totalAmount } = payload;
  console.log(payload);
  if (!email && !phone && !userId) return null;
  // 🎯 query অবজেক্টে সঠিক Mongoose Types বসানো
  const query: any = { status: "PENDING" };

  if (userId && Types.ObjectId.isValid(userId)) {
    query.userId = new Types.ObjectId(userId);
  } else if (email) {
    query.email = email;
  } else if (phone) {
    query.phone = phone;
  }

  const updatedCart = await AbandonedCart.findOneAndUpdate(
    query,
    {
      userId,
      email,
      phone,
      name,
      items,
      totalAmount,
      status: "PENDING",
    },
    { upsert: true, new: true }, // না থাকলে নতুন বানাবে, থাকলে আপডেট করবে
  );

  return updatedCart;
};

export const markCartAsRecoveredService = async (identifier: {
  userId?: string;
  email?: string;
  phone?: string;
}) => {
  const query: any = { status: "PENDING" };

  if (identifier.userId && Types.ObjectId.isValid(identifier.userId)) {
    query.userId = new Types.ObjectId(identifier.userId);
  } else if (identifier.email) {
    query.email = identifier.email;
  } else if (identifier.phone) {
    query.phone = identifier.phone;
  }

  await AbandonedCart.updateMany(query, { $set: { status: "RECOVERED" } });
};
