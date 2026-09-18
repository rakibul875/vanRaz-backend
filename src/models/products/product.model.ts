import { model, Schema } from "mongoose";
import { IProducts } from "./product.interface";

const productsSchema = new Schema<IProducts>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    // Relational Fields
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    brand: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "out_of_stock", "hidden"],
      default: "approved",
    },

    // Home Section Flags & Details
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    flashSalePrice: {
      type: Number,
    },
    flashSaleEndDate: {
      type: Date,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Mongoose Query Middleware: Deleted Product Filter out
productsSchema.pre("find", function () {
  this.find({ isDeleted: { $ne: true } });
});

productsSchema.pre("findOne", function () {
  this.find({ isDeleted: { $ne: true } });
});

export const Product = model<IProducts>("Product", productsSchema);
