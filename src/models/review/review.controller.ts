import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { ReviewService } from './review.service';

const addReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await ReviewService.addReviewInDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;

  const result = await ReviewService.getProductReviewsFromDB(productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product reviews retrieved successfully',
    data: result,
  });
});

const getShopProducts = catchAsync(async (req: Request, res: Response) => {
  const shopId = req.params.shopId as string;

  const result = await ReviewService.getShopProductsFromDB(shopId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Shop products retrieved successfully',
    data: result,
  });
});

export const ReviewController = {
  addReview,
  getProductReviews,
  getShopProducts,
};
