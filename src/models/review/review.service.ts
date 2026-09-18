import mongoose from 'mongoose';
import { Review } from './review.model';
import { ICreateReviewPayload, IReviewDocument } from './review.interface';
import { Product } from '../products/product.model';
import { Shop } from '../sop/sop.model';

const addReviewInDB = async (
  userId: string,
  payload: ICreateReviewPayload
): Promise<IReviewDocument> => {
  const { productId, rating, comment } = payload;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw { statusCode: 404, message: 'Product not found!' };
  }

  // Create review
  const review = await Review.create({
    userId,
    productId,
    rating,
    comment,
  });

  // Algorithm 1: Recalculate and update Product rating & totalReviews
  const productReviews = await Review.find({ productId });
  const totalReviews = productReviews.length;
  const avgRating =
    totalReviews > 0
      ? Math.round(
          (productReviews.reduce((sum, r) => sum + r.rating, 0) /
            totalReviews) *
            10
        ) / 10
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    totalReviews,
  });

  // Algorithm 2: Recalculate and update Shop rating
  if (product.shop) {
    try {
      const shopProducts = await Product.find({ shop: product.shop });
      const shopProductIds = shopProducts.map((p: any) => p._id);

      const shopReviews = await Review.find({
        productId: { $in: shopProductIds },
      });
      const shopTotalReviews = shopReviews.length;
      const shopAvgRating =
        shopTotalReviews > 0
          ? Math.round(
              (shopReviews.reduce((sum, r) => sum + r.rating, 0) /
                shopTotalReviews) *
                10
            ) / 10
          : 0;

      await Shop.findByIdAndUpdate(product.shop, {
        rating: shopAvgRating,
      });
    } catch (err) {
      console.warn('Could not auto-update shop rating:', err);
    }
  }

  return (await review.populate('userId', 'name email avatar')) as IReviewDocument;
};

const getProductReviewsFromDB = async (
  productId: string
): Promise<IReviewDocument[]> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const reviews = await Review.find({ productId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 });

  return reviews;
};

const getShopProductsFromDB = async (shopId: string) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw { statusCode: 400, message: 'Invalid shop ID format' };
  }

  const products = await Product.find({
    shop: new mongoose.Types.ObjectId(shopId),
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });

  return products;
};

export const ReviewService = {
  addReviewInDB,
  getProductReviewsFromDB,
  getShopProductsFromDB,
};
