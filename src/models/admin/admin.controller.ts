import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { AdminService } from './admin.service';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin dashboard overview statistics fetched successfully',
    data: result,
  });
});

const getPendingShops = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getPendingShopsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pending shops retrieved successfully',
    data: result,
  });
});

const approveShop = catchAsync(async (req: Request, res: Response) => {
  const shopId = req.params.shopId as string;
  const result = await AdminService.approveShopInDB(shopId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Shop approved successfully',
    data: result,
  });
});

const rejectShop = catchAsync(async (req: Request, res: Response) => {
  const shopId = req.params.shopId as string;
  const { reason } = req.body;
  const result = await AdminService.rejectShopInDB(shopId, reason);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Shop rejected successfully',
    data: result,
  });
});

const getPendingProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getPendingProductsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pending products retrieved successfully',
    data: result,
  });
});

const approveProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const result = await AdminService.approveProductInDB(productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product approved successfully',
    data: result,
  });
});

const rejectProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const { reason } = req.body;
  const result = await AdminService.rejectProductInDB(productId, reason);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product rejected successfully',
    data: result,
  });
});

// ======================= Day 5: User & Order Controllers =======================

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    search: req.query.search as string,
    role: req.query.role as string,
    status: req.query.status as string,
  };

  const result = await AdminService.getAllUsersFromDB(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { role } = req.body;

  const result = await AdminService.updateUserRoleInDB(userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User role updated to '${role}' successfully`,
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { status } = req.body;

  const result = await AdminService.updateUserStatusInDB(userId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User account status updated to '${status}' successfully`,
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    status: req.query.status as string,
  };

  const result = await AdminService.getAllOrdersFromDB(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All system orders retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;
  const { status } = req.body;

  const result = await AdminService.updateOrderStatusInDB(orderId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Order status updated to '${status}' successfully`,
    data: result,
  });
});

export const AdminController = {
  getDashboardStats,
  getPendingShops,
  approveShop,
  rejectShop,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getAllOrders,
  updateOrderStatus,
};
