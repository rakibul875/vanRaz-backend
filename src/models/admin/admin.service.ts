import mongoose from 'mongoose';
import {
  IAdminDashboardStats,
  IUserQueryFilters,
  IOrderQueryFilters,
} from './admin.interface';
import { User } from '../user/user.model';
import { Shop } from '../sop/sop.model';
import { Product } from '../products/product.model';
import { Order } from '../order/order.model';

const getDashboardStatsFromDB = async (): Promise<IAdminDashboardStats> => {
  let totalRevenue = 0;
  try {
    const revenueResult = await Order.aggregate([
      { $match: { isCancelled: { $ne: true }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    if (revenueResult.length > 0) {
      totalRevenue = revenueResult[0].total;
    }
  } catch (error) {
    console.warn('Could not aggregate order revenue:', error);
  }

  const [
    totalUsers,
    totalShops,
    totalOrders,
    totalProducts,
    pendingShops,
    pendingProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Shop.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({ isDeleted: { $ne: true } }),
    Shop.countDocuments({ status: 'pending' }),
    Product.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
  ]);

  return {
    totalRevenue,
    totalUsers,
    totalShops,
    totalOrders,
    totalProducts,
    pendingShops,
    pendingProducts,
  };
};

const getPendingShopsFromDB = async () => {
  const pendingShops = await Shop.find({ status: 'pending' }).sort({
    createdAt: -1,
  });
  return pendingShops;
};

const approveShopInDB = async (shopId: string) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw { statusCode: 400, message: 'Invalid shop ID format' };
  }

  const shop = await Shop.findByIdAndUpdate(
    shopId,
    { status: 'approved' },
    { new: true }
  );

  if (!shop) {
    throw { statusCode: 404, message: 'Shop not found' };
  }

  return shop;
};

const rejectShopInDB = async (shopId: string, reason: string) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw { statusCode: 400, message: 'Invalid shop ID format' };
  }

  const shop = await Shop.findByIdAndUpdate(
    shopId,
    { status: 'rejected', rejectionReason: reason || 'Does not meet platform guidelines' },
    { new: true }
  );

  if (!shop) {
    throw { statusCode: 404, message: 'Shop not found' };
  }

  return shop;
};

const getPendingProductsFromDB = async () => {
  const pendingProducts = await Product.find({
    status: 'pending',
    isDeleted: { $ne: true },
  })
    .populate('shop', 'name ownerId phone')
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  return pendingProducts;
};

const approveProductInDB = async (productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { status: 'approved' },
    { new: true }
  );

  if (!product) {
    throw { statusCode: 404, message: 'Product not found' };
  }

  return product;
};

const rejectProductInDB = async (productId: string, reason?: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { status: 'rejected' },
    { new: true }
  );

  if (!product) {
    throw { statusCode: 404, message: 'Product not found' };
  }

  return product;
};

// ======================= Day 5: User & Order Management =======================

const getAllUsersFromDB = async (filters: IUserQueryFilters) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const updateUserRoleInDB = async (userId: string, newRole: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw { statusCode: 400, message: 'Invalid user ID format' };
  }

  // Security rules audit: admin role can never be assigned via API
  if (newRole === 'admin') {
    throw {
      statusCode: 403,
      message: 'Security Violation: Admin role cannot be assigned or changed via API!',
    };
  }

  if (!['user', 'moderator'].includes(newRole)) {
    throw {
      statusCode: 400,
      message: "Invalid role! Allowed roles are 'user' or 'moderator'.",
    };
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw { statusCode: 404, message: 'User not found!' };
  }

  // Security check: cannot demote existing admin via API
  if (targetUser.role === 'admin') {
    throw {
      statusCode: 403,
      message: 'Security Violation: Existing Admin accounts cannot have their roles modified via API!',
    };
  }

  targetUser.role = newRole as any;
  await targetUser.save();

  return targetUser;
};

const updateUserStatusInDB = async (userId: string, newStatus: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw { statusCode: 400, message: 'Invalid user ID format' };
  }

  if (!['active', 'blocked'].includes(newStatus)) {
    throw {
      statusCode: 400,
      message: "Invalid status! Allowed values are 'active' or 'blocked'.",
    };
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw { statusCode: 404, message: 'User not found!' };
  }

  // Security check: cannot block an admin account
  if (targetUser.role === 'admin') {
    throw {
      statusCode: 403,
      message: 'Security Violation: Admin accounts cannot be blocked!',
    };
  }

  targetUser.status = newStatus as any;
  await targetUser.save();

  return targetUser;
};

const getAllOrdersFromDB = async (filters: IOrderQueryFilters) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (filters.status) {
    query.status = filters.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email phone avatar')
      .populate('items.product', 'name price images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Order.countDocuments(query),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: orders,
  };
};

const updateOrderStatusInDB = async (orderId: string, status: string) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw { statusCode: 400, message: 'Invalid order ID format' };
  }

  const allowedStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  if (!allowedStatuses.includes(status)) {
    throw {
      statusCode: 400,
      message: `Invalid order status! Allowed statuses: [${allowedStatuses.join(', ')}]`,
    };
  }

  const updateData: Record<string, any> = { status };
  if (status === 'cancelled') {
    updateData.isCancelled = true;
  }

  const order = await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
  })
    .populate('user', 'name email phone avatar')
    .populate('items.product', 'name price images');

  if (!order) {
    throw { statusCode: 404, message: 'Order not found!' };
  }

  return order;
};

export const AdminService = {
  getDashboardStatsFromDB,
  getPendingShopsFromDB,
  approveShopInDB,
  rejectShopInDB,
  getPendingProductsFromDB,
  approveProductInDB,
  rejectProductInDB,
  getAllUsersFromDB,
  updateUserRoleInDB,
  updateUserStatusInDB,
  getAllOrdersFromDB,
  updateOrderStatusInDB,
};
