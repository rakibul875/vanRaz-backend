import mongoose from 'mongoose';
import { RecentView } from './recentView.model';
import { IRecentViewDocument } from './recentView.interface';
import { Product } from '../products/product.model';

const recordRecentViewInDB = async (
  userId: string,
  productId: string
): Promise<IRecentViewDocument> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw { statusCode: 404, message: 'Product not found' };
  }

  const recentView = await RecentView.findOneAndUpdate(
    { userId, productId },
    { viewedAt: new Date() },
    { upsert: true, new: true }
  ).populate('productId', 'name slug price images rating discount');

  return recentView as IRecentViewDocument;
};

const getUserRecentViewsFromDB = async (
  userId: string
): Promise<IRecentViewDocument[]> => {
  const recentViews = await RecentView.find({ userId })
    .sort({ viewedAt: -1 })
    .limit(20)
    .populate('productId', 'name slug price images rating discount status stock');

  return recentViews;
};

export const RecentViewService = {
  recordRecentViewInDB,
  getUserRecentViewsFromDB,
};
