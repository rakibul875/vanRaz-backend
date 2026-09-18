import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CartControllers } from "../../models/card/cart.controller";

const router = express.Router();

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get(
  "/",
  authMiddleware("user", "moderator", "admin"),
  CartControllers.getCart,
);

/**
 * @swagger
 * /api/v1/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       200:
 *         description: Product added to cart
 */
router.post(
  "/",
  authMiddleware("user", "moderator", "admin"),
  CartControllers.addToCart,
);

/**
 * @swagger
 * /api/v1/cart/{productId}:
 *   patch:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quantity updated successfully
 */
router.patch(
  "/:productId",
  authMiddleware("user", "moderator", "admin"),
  CartControllers.updateCartQuantity,
);

/**
 * @swagger
 * /api/v1/cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete(
  "/:productId",
  authMiddleware("user", "moderator", "admin"),
  CartControllers.removeCartItem,
);

export const CartRoutes = router;
