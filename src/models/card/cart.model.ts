import { Schema, model } from "mongoose";
import { ICart, ICartItem } from "./cart.interface";

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Helper method to calculate cart total
cartSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.items.reduce(
    (acc: number, item: ICartItem) => acc + item.price * item.quantity,
    0,
  );
};

export const Cart = model<ICart>("Cart", cartSchema);

// const abandonedCartSchema = new Schema(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "User" }, // যদি লগইন করা ইউজার হয়
//     guestInfo: {
//       name: String,
//       email: String,
//       phone: String,
//       address: String,
//     },
//     items: [
//       {
//         productId: { type: Schema.Types.ObjectId, ref: "Product" },
//         quantity: Number,
//         price: Number,
//       },
//     ],
//     totalAmount: Number,
//     status: {
//       type: String,
//       enum: ["PENDING", "RECOVERED", "EXPIRED"],
//       default: "PENDING",
//     },
//     recoveryEmailSent: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// export const AbandonedCart = model("AbandonedCart", abandonedCartSchema);
