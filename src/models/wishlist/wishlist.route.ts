import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Get all wishlist items for current user
 *     tags:
 *       - Wishlist & User Dashboard (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  WishlistController.getWishlist
);

/**
 * @openapi
 * /wishlist/{productId}:
 *   post:
 *     summary: Add product to user wishlist
 *     tags:
 *       - Wishlist & User Dashboard (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of product to add to wishlist
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:productId',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  WishlistController.addToWishlist
);

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove product from user wishlist
 *     tags:
 *       - Wishlist & User Dashboard (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of product to remove from wishlist
 *     responses:
 *       200:
 *         description: Product removed from wishlist successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:productId',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  WishlistController.removeFromWishlist
);

export const WishlistRoutes = router;
