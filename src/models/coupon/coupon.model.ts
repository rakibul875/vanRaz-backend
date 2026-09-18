import { Schema, model } from "mongoose";

export interface ICoupon {
  code: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  expiresAt: Date;
  isActive: boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    maxDiscountAmount: { type: Number, required: true },
    minOrderAmount: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);
