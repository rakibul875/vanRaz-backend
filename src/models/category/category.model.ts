// src/app/modules/category/category.model.ts
import { CallbackError, Schema, model } from "mongoose";
import { ICategory, CategoryModel } from "./category.interface";

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Filter out deleted items during queries
categorySchema.pre("find", async function () {
  this.find({ isDeleted: { $ne: true } });
});
categorySchema.pre("findOne", async function () {
  this.find({ isDeleted: { $ne: true } });
});

categorySchema.pre("findOneAndUpdate", async function () {
  this.find({ isDeleted: { $ne: true } });
});

export const Category = model<ICategory, CategoryModel>(
  "Category",
  categorySchema,
);
