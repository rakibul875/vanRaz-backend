import { Document, Types } from 'mongoose';

export interface IWishlist {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  productIds: Types.ObjectId[] | string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWishlistDocument extends Omit<IWishlist, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IUserDashboardOverview {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  wishlistCount: number;
}
