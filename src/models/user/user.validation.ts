import { z } from "zod";

const addressValidationSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh"),
});

// 1. User Creation Schema (POST Request for User Create / Register)
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    role: z.enum(["user", "moderator", "admin"]).default("user"),
    status: z.enum(["active", "blocked"]).default("active"),
    address: addressValidationSchema.optional(),
  }),
});

// 2. Update Profile Schema
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    address: addressValidationSchema.optional(),
  }),
});

// 3. Change Password Schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});

export const UserValidations = {
  createUserSchema,
  updateProfileSchema,
  changePasswordSchema,
};
