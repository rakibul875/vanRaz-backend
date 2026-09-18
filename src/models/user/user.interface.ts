import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface IAddress {
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  country: string;
}

export interface IUser {
  _id?: Types.ObjectId | string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  address?: IAddress;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: IAddress;
}

export interface IChangePasswordPayload {
  oldPassword?: string;
  currentPassword?: string;
  newPassword?: string;
}
