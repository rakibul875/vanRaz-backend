import { Schema, model } from 'mongoose';
import { IWishlistDocument } from './wishlist.interface';

const wishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = model<IWishlistDocument>('Wishlist', wishlistSchema);
