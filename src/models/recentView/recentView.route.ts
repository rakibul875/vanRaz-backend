import { Router } from 'express';
import { RecentViewController } from './recentView.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @openapi
 * /users/recent-views/{productId}:
 *   post:
 *     summary: Record a product in user's recently viewed list
 *     tags:
 *       - User Address Book & Recent Views (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product viewed
 *     responses:
 *       200:
 *         description: Recently viewed product recorded successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:productId',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  RecentViewController.recordRecentView
);

/**
 * @openapi
 * /users/recent-views:
 *   get:
 *     summary: Get user's recently viewed products list
 *     tags:
 *       - User Address Book & Recent Views (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  RecentViewController.getUserRecentViews
);

export const RecentViewRoutes = router;
