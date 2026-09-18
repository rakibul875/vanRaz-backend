import mongoose, { Types } from 'mongoose';
import { Wishlist } from './wishlist.model';
import { IWishlistDocument, IUserDashboardOverview } from './wishlist.interface';

const addToWishlistInDB = async (
  userId: string,
  productId: string
): Promise<IWishlistDocument> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId,
      productIds: [new Types.ObjectId(productId)],
    });
  } else {
    const productIdStr = productId.toString();
    const exists = wishlist.productIds.some(
      (id) => id.toString() === productIdStr
    );

    if (!exists) {
      (wishlist.productIds as any).push(new Types.ObjectId(productId));
      await wishlist.save();
    }
  }

  return (await wishlist.populate('productIds')) as IWishlistDocument;
};

const getWishlistFromDB = async (userId: string): Promise<IWishlistDocument | null> => {
  let wishlist = await Wishlist.findOne({ userId }).populate('productIds');

  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId,
      productIds: [],
    });
  }

  return wishlist;
};

const removeFromWishlistInDB = async (
  userId: string,
  productId: string
): Promise<IWishlistDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { productIds: productId } },
    { new: true }
  ).populate('productIds');

  if (!wishlist) {
    throw { statusCode: 404, message: 'Wishlist not found for user' };
  }

  return wishlist;
};

const getUserDashboardOverviewFromDB = async (
  userId: string
): Promise<IUserDashboardOverview> => {
  const wishlist = await Wishlist.findOne({ userId });
  const wishlistCount = wishlist ? wishlist.productIds.length : 0;

  let totalOrders = 0;
  let pendingOrders = 0;
  let completedOrders = 0;

  try {
    const OrderModel = mongoose.models.Order;
    if (OrderModel) {
      totalOrders = await OrderModel.countDocuments({ userId });
      pendingOrders = await OrderModel.countDocuments({
        userId,
        orderStatus: { $in: ['pending', 'processing'] },
      });
      completedOrders = await OrderModel.countDocuments({
        userId,
        orderStatus: 'delivered',
      });
    }
  } catch (error) {
    console.warn('Order collection query skipped during overview calculation.');
  }

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    wishlistCount,
  };
};

export const WishlistService = {
  addToWishlistInDB,
  getWishlistFromDB,
  removeFromWishlistInDB,
  getUserDashboardOverviewFromDB,
};
