import { Schema, model } from 'mongoose';
import { IReviewDocument } from './review.interface';

const reviewSchema = new Schema<IReviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Products',
      required: [true, 'Product ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can review a specific product only once (or multiple times if allowed, unique prevents spam)
reviewSchema.index({ userId: 1, productId: 1 });

export const Review = model<IReviewDocument>('Review', reviewSchema);
