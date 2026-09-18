import { Schema, model, Document, Types } from "mongoose";

export interface IAbandonedCart extends Document {
  userId?: Types.ObjectId;
  email?: string;
  phone?: string;
  name?: string;
  items: Array<{
    productId: Schema.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  status: "PENDING" | "RECOVERED" | "EXPIRED";
  recoveryEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const abandonedCartSchema = new Schema<IAbandonedCart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    name: { type: String, trim: true },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "RECOVERED", "EXPIRED"],
      default: "PENDING",
    },
    recoveryEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AbandonedCart = model<IAbandonedCart>(
  "AbandonedCart",
  abandonedCartSchema,
);
