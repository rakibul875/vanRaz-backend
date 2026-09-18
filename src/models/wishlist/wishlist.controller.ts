import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { WishlistService } from './wishlist.service';

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const productId = req.params.productId as string;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await WishlistService.addToWishlistInDB(userId, productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product added to wishlist successfully',
    data: result,
  });
});

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await WishlistService.getWishlistFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wishlist items retrieved successfully',
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const productId = req.params.productId as string;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await WishlistService.removeFromWishlistInDB(userId, productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product removed from wishlist successfully',
    data: result,
  });
});

const getUserDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await WishlistService.getUserDashboardOverviewFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User dashboard overview statistics fetched successfully',
    data: result,
  });
});

export const WishlistController = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getUserDashboardOverview,
};
