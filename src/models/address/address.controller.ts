import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { AddressService } from './address.service';

const addAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await AddressService.addAddressInDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Address added successfully',
    data: result,
  });
});

const getUserAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await AddressService.getUserAddressesFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User addresses retrieved successfully',
    data: result,
  });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const addressId = req.params.addressId as string;
  const result = await AddressService.updateAddressInDB(
    userId,
    addressId,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const addressId = req.params.addressId as string;
  const result = await AddressService.deleteAddressFromDB(userId, addressId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address deleted successfully',
    data: result,
  });
});

export const AddressController = {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
};
