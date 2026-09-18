import { Schema, model } from 'mongoose';
import { IAddressDocument } from './address.interface';

const addressSchema = new Schema<IAddressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Bangladesh',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },
  },
  { timestamps: true }
);

export const Address = model<IAddressDocument>('Address', addressSchema);
