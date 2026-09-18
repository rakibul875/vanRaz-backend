import mongoose from 'mongoose';
import { Address } from './address.model';
import {
  IAddressDocument,
  ICreateAddressPayload,
  IUpdateAddressPayload,
} from './address.interface';

const addAddressInDB = async (
  userId: string,
  payload: ICreateAddressPayload
): Promise<IAddressDocument> => {
  const existingCount = await Address.countDocuments({ userId });
  const shouldBeDefault = payload.isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  const address = await Address.create({
    userId,
    ...payload,
    isDefault: shouldBeDefault,
  });

  return address;
};

const getUserAddressesFromDB = async (
  userId: string
): Promise<IAddressDocument[]> => {
  const addresses = await Address.find({ userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  return addresses;
};

const updateAddressInDB = async (
  userId: string,
  addressId: string,
  payload: IUpdateAddressPayload
): Promise<IAddressDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw { statusCode: 400, message: 'Invalid address ID format' };
  }

  const addressExists = await Address.findOne({ _id: addressId, userId });
  if (!addressExists) {
    throw { statusCode: 404, message: 'Address not found or unauthorized' };
  }

  if (payload.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    payload,
    { new: true, runValidators: true }
  );

  return updatedAddress;
};

const deleteAddressFromDB = async (
  userId: string,
  addressId: string
): Promise<IAddressDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw { statusCode: 400, message: 'Invalid address ID format' };
  }

  const deletedAddress = await Address.findOneAndDelete({
    _id: addressId,
    userId,
  });

  if (!deletedAddress) {
    throw { statusCode: 404, message: 'Address not found or unauthorized' };
  }

  if (deletedAddress.isDefault) {
    const nextAddress = await Address.findOne({ userId }).sort({
      createdAt: -1,
    });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return deletedAddress;
};

export const AddressService = {
  addAddressInDB,
  getUserAddressesFromDB,
  updateAddressInDB,
  deleteAddressFromDB,
};
