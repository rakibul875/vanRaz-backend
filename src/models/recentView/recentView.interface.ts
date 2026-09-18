import { Document, Types } from 'mongoose';

export interface IRecentView {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  productId: Types.ObjectId | string;
  viewedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecentViewDocument extends Omit<IRecentView, '_id'>, Document {
  _id: Types.ObjectId;
}
