import mongoose, { Schema, model } from "mongoose";
import { IUserDocument } from "./user.interface";

const addressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true, default: "Bangladesh" },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    address: { type: addressSchema },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

export const User = model<IUserDocument>("user", userSchema, "user");

// Alias registration so Populate with ref: "User" (capital U) resolves too.
// The canonical model name is lowercase "user" (used by Better-Auth + auth middleware),
// but several schemas reference the capitalized form.
mongoose.model("User", userSchema, "user");

interface ISession extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Session = model<ISession>("Session", sessionSchema, "session");
