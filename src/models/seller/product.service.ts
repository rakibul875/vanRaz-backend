import { Product } from "./product.model";
import {
  ICreateProductPayload,
  ISellerDashboardStats,
  IUpdateProductPayload,
} from "./seller.interface";

export const createProductIntoDB = async (payload: ICreateProductPayload) => {
  const result = await Product.create(payload);
  return result;
};

export const getMyProductsFromDB = async (sellerId: string) => {
  const result = await Product.find({ seller: sellerId });
  return result;
};

export const updateProductInDB = async (
  productId: string,
  payload: IUpdateProductPayload,
) => {
  const result = await Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const updateStockInDB = async (productId: string, stock: number) => {
  const result = await Product.findByIdAndUpdate(
    productId,
    { stock },
    { new: true },
  );
  return result;
};

export const getSellerDashboardStatsFromDB = async (
  sellerId: string,
): Promise<ISellerDashboardStats> => {
  const totalProducts = await Product.countDocuments({ seller: sellerId });

  return {
    totalProducts,
    totalOrders: 0,
    totalSales: 0,
  };
};
