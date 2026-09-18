import { Schema, model } from 'mongoose';
import { IRecentViewDocument } from './recentView.interface';

const recentViewSchema = new Schema<IRecentViewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

recentViewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const RecentView = model<IRecentViewDocument>('RecentView', recentViewSchema);
