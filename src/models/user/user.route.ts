import { Router } from "express";
import { UserController } from "./user.controller";
import { WishlistController } from "../wishlist/wishlist.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { UserValidations } from "./user.validation";

const router = Router();

/**
 * User Registration (POST Request)
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user (User Registration / Admin Creation)
 *     tags:
 *       - User & Profile Management (Member 3)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: MD Limon
 *               email:
 *                 type: string
 *                 format: email
 *                 example: fhlimon36@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               phone:
 *                 type: string
 *                 example: "01754318654"
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin]
 *                 default: user
 *                 example: user
 *               status:
 *                 type: string
 *                 enum: [active, blocked]
 *                 default: active
 *                 example: active
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: Dhanmondi 32
 *                   city:
 *                     type: string
 *                     example: Dhaka
 *                   district:
 *                     type: string
 *                     example: Dhaka
 *                   postalCode:
 *                     type: string
 *                     example: "1205"
 *                   country:
 *                     type: string
 *                     default: Bangladesh
 *                     example: Bangladesh
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 66e01a2b3c4d5e6f7a8b9c0e1
 *                     name:
 *                       type: string
 *                       example: MD Limon
 *                     email:
 *                       type: string
 *                       example: fhlimon36@gmail.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     status:
 *                       type: string
 *                       example: active
 *       400:
 *         description: Bad Request / Validation Error (e.g. Email already exists or invalid input)
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/",
  validateRequest(UserValidations.createUserSchema), // Register Validation
  UserController.createUser, // Controller method to create user in DB
);
/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - User & Profile Management (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 */
router.get(
  "/profile",
  authMiddleware(),
  roleMiddleware("user", "moderator", "admin"),
  UserController.getProfile,
);

/**
 * @openapi
 * /users/dashboard-overview:
 *   get:
 *     summary: Get user dashboard statistics overview
 *     tags:
 *       - Wishlist & User Dashboard (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard overview statistics fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/dashboard-overview",
  authMiddleware(),
  roleMiddleware("user", "moderator", "admin"),
  WishlistController.getUserDashboardOverview,
);

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     summary: Update current user profile info and avatar image
 *     tags:
 *       - User & Profile Management (Member 3)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "01712345678"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file to upload to Cloudinary
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/profile",
  authMiddleware(),
  roleMiddleware("user", "moderator", "admin"),
  upload.single("avatar"),
  validateRequest(UserValidations.updateProfileSchema),
  UserController.updateProfile,
);

/**
 * @openapi
 * /users/change-password:
 *   patch:
 *     summary: Change password for current user
 *     tags:
 *       - User & Profile Management (Member 3)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password does not match or validation failed
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/change-password",
  authMiddleware(),
  roleMiddleware("user", "moderator", "admin"),
  validateRequest(UserValidations.changePasswordSchema),
  UserController.changePassword,
);

export const UserRoutes = router;
