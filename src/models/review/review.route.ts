import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Add review and rating for a product (Auto-updates Product and Shop ratings)
 *     tags:
 *       - Review System & Shop Products (Member 3)
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
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64f123456789a1b2c3d4e5f6
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent build quality and fast delivery!
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Invalid input or product ID
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  ReviewController.addReview
);

/**
 * @openapi
 * /reviews/{productId}:
 *   get:
 *     summary: Get all reviews for a specific product
 *     tags:
 *       - Review System & Shop Products (Member 3)
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 *       400:
 *         description: Invalid product ID
 */
router.get('/:productId', ReviewController.getProductReviews);

export const ReviewRoutes = router;
