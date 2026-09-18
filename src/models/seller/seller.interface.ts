import { Types } from "mongoose";

export interface ICreateProductPayload {
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  discount?: number;
  stock: number;
  category: Types.ObjectId | string;
  shop: Types.ObjectId | string;
  seller: Types.ObjectId | string;
  brand?: string;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndDate?: Date | string;
  status?: "pending" | "approved" | "rejected";
}

export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  images?: string[];
  price?: number;
  discount?: number;
  stock?: number;
  category?: Types.ObjectId | string;
  brand?: string;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndDate?: Date | string;
}

export interface IUpdateStockPayload {
  stock: number;
}

export interface ISellerDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}
