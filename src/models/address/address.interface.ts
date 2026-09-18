import { Document, Types } from 'mongoose';

export type AddressType = 'home' | 'office' | 'other';

export interface IAddressItem {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  type: AddressType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddressDocument extends Omit<IAddressItem, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface ICreateAddressPayload {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  type?: AddressType;
}

export interface IUpdateAddressPayload extends Partial<ICreateAddressPayload> {}
