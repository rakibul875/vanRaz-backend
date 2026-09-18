import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { UserService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;
  const result = await UserService.createUserProfileFromDB(userData);
  return result;
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const result = await UserService.getUserProfileFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  // Parse body if form-data
  let payload = req.body;
  if (typeof req.body.data === "string") {
    payload = JSON.parse(req.body.data);
  }

  const file = req.file;
  const result = await UserService.updateUserProfileInDB(userId, payload, file);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  await UserService.changeUserPasswordInDB(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully",
  });
});

export const UserController = {
  createUser,
  getProfile,
  updateProfile,
  changePassword,
};
