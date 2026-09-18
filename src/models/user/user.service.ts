import bcrypt from "bcrypt";
import { User } from "./user.model";
import {
  IUpdateProfilePayload,
  IChangePasswordPayload,
  IUserDocument,
} from "./user.interface";
import { uploadToCloudinary } from "../../middlewares/upload.middleware";

const createUserProfileFromDB = async (payload: any) => {
  const result = await User.create(payload);

  return result;
};

const getUserProfileFromDB = async (userId: string): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw { statusCode: 404, message: "User profile not found!" };
  }
  return user;
};

const updateUserProfileInDB = async (
  userId: string,
  payload: IUpdateProfilePayload,
  file?: Express.Multer.File,
): Promise<IUserDocument | null> => {
  const user = await User.findById(userId);
  if (!user) {
    throw { statusCode: 404, message: "User not found!" };
  }

  let avatarUrl = user.avatar;
  if (file) {
    avatarUrl = await uploadToCloudinary(file.buffer, "venraz/avatars");
  }

  const updatedData: Partial<IUpdateProfilePayload> = {
    ...payload,
  };

  if (avatarUrl) {
    updatedData.avatar = avatarUrl;
  }

  const result = await User.findByIdAndUpdate(userId, updatedData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const changeUserPasswordInDB = async (
  userId: string,
  payload: IChangePasswordPayload,
): Promise<void> => {
  const { currentPassword, newPassword } = payload;

  if (!currentPassword || !newPassword) {
    throw {
      statusCode: 400,
      message: "Both currentPassword and newPassword are required!",
    };
  }

  const user = await User.findById(userId).select("+password");
  if (!user || !user.password) {
    throw { statusCode: 404, message: "User not found!" };
  }

  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password,
  );
  if (!isPasswordMatched) {
    throw { statusCode: 400, message: "Current password does not match!" };
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  user.password = hashedNewPassword;
  await user.save();
};

export const UserService = {
  createUserProfileFromDB,
  getUserProfileFromDB,
  updateUserProfileInDB,
  changeUserPasswordInDB,
};
