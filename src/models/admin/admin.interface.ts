export interface IAdminDashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  totalProducts: number;
  pendingShops: number;
  pendingProducts: number;
}

export interface IShopRejectPayload {
  reason: string;
}

export interface IProductRejectPayload {
  reason?: string;
}

export interface IUserRoleUpdatePayload {
  role: 'user' | 'moderator';
}

export interface IUserStatusUpdatePayload {
  status: 'active' | 'blocked';
}

export interface IOrderStatusUpdatePayload {
  status: string;
}

export interface IUserQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface IOrderQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
}
