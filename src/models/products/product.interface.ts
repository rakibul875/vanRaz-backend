import { Types } from "mongoose";

export type ProductStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "out_of_stock"
  | "hidden";

export interface IProducts {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  userId?: string;
  description: string;
  images: string[];
  price: number;
  discount?: number;
  stock: number;

  // Relational IDs
  category: Types.ObjectId;
  shop: Types.ObjectId;
  seller: Types.ObjectId;

  brand?: string;
  rating: number;
  totalReviews?: number;
  soldCount: number;
  status: ProductStatus;

  // Home Page Section Specific Fields
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndDate?: Date | string;

  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Query Parameters Type Definition
export interface IProductQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}
