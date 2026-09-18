import { Schema, model } from "mongoose";
import { IShop } from "../../types/sop/sop";

const shopSchema = new Schema<IShop>(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "active", "rejected", "suspended"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Shop = model<IShop>("Shop", shopSchema);
