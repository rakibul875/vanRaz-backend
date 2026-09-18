import { Document, Types } from 'mongoose';

export interface IReview {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  productId: Types.ObjectId | string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReviewDocument extends Omit<IReview, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface ICreateReviewPayload {
  productId: string;
  rating: number;
  comment: string;
}
