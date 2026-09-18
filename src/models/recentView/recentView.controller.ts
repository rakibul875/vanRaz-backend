import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { RecentViewService } from './recentView.service';

const recordRecentView = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const productId = req.params.productId as string;
  const result = await RecentViewService.recordRecentViewInDB(userId, productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recently viewed product recorded',
    data: result,
  });
});

const getUserRecentViews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await RecentViewService.getUserRecentViewsFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recently viewed products retrieved successfully',
    data: result,
  });
});

export const RecentViewController = {
  recordRecentView,
  getUserRecentViews,
};
