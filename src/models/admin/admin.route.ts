import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

// Apply auth and admin role guard for all admin routes
router.use(authMiddleware(), roleMiddleware('admin'));

/**
 * @openapi
 * /admin/dashboard-stats:
 *   get:
 *     summary: Get overall admin dashboard statistics (Revenue, Users, Shops, Orders, Products)
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard overview statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard-stats', AdminController.getDashboardStats);

/**
 * @openapi
 * /admin/shops/pending:
 *   get:
 *     summary: Get all pending shops awaiting admin approval
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending shops retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/shops/pending', AdminController.getPendingShops);

/**
 * @openapi
 * /admin/shops/{shopId}/approve:
 *   patch:
 *     summary: Approve a pending shop
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the shop to approve
 *     responses:
 *       200:
 *         description: Shop approved successfully
 *       404:
 *         description: Shop not found
 */
router.patch('/shops/:shopId/approve', AdminController.approveShop);

/**
 * @openapi
 * /admin/shops/{shopId}/reject:
 *   patch:
 *     summary: Reject or suspend a shop with reason
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the shop to reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Trade license could not be verified
 *     responses:
 *       200:
 *         description: Shop rejected successfully
 *       404:
 *         description: Shop not found
 */
router.patch('/shops/:shopId/reject', AdminController.rejectShop);

/**
 * @openapi
 * /admin/products/pending:
 *   get:
 *     summary: Get all pending products awaiting admin moderation
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/products/pending', AdminController.getPendingProducts);

/**
 * @openapi
 * /admin/products/{productId}/approve:
 *   patch:
 *     summary: Approve a pending product
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the product to approve
 *     responses:
 *       200:
 *         description: Product approved successfully
 *       404:
 *         description: Product not found
 */
router.patch('/products/:productId/approve', AdminController.approveProduct);

/**
 * @openapi
 * /admin/products/{productId}/reject:
 *   patch:
 *     summary: Reject a pending product with reason
 *     tags:
 *       - Admin Dashboard & Moderation (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the product to reject
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Product image violates platform policy
 *     responses:
 *       200:
 *         description: Product rejected successfully
 *       404:
 *         description: Product not found
 */
router.patch('/products/:productId/reject', AdminController.rejectProduct);

// ======================= Day 5: User Management & Security Routes =======================

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Get all users with search, role, status filters, and pagination
 *     tags:
 *       - Admin Management & Security (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user name, email, or phone
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, moderator, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, blocked]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @openapi
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: "Change user role (User <-> Moderator). Note: Admin role CANNOT be assigned via API (Security Audit)"
 *     tags:
 *       - Admin Management & Security (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, moderator]
 *                 example: moderator
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role specified
 *       403:
 *         description: Security Violation - Admin role cannot be assigned via API
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId/role', AdminController.updateUserRole);

/**
 * @openapi
 * /admin/users/{userId}/status:
 *   patch:
 *     summary: Block or unblock a user account (active <-> blocked)
 *     tags:
 *       - Admin Management & Security (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, blocked]
 *                 example: blocked
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       403:
 *         description: Security Violation - Admin account cannot be blocked
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId/status', AdminController.updateUserStatus);

// ======================= Day 5: Admin Order Management Routes =======================

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     summary: Get all system orders across all users with user and product population
 *     tags:
 *       - Admin Management & Security (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled]
 *     responses:
 *       200:
 *         description: All system orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/orders', AdminController.getAllOrders);

/**
 * @openapi
 * /admin/orders/{orderId}/status:
 *   patch:
 *     summary: Forcefully update order status (Admin Force Override)
 *     tags:
 *       - Admin Management & Security (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled]
 *                 example: delivered
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid order status
 *       404:
 *         description: Order not found
 */
router.patch('/orders/:orderId/status', AdminController.updateOrderStatus);

export const AdminRoutes = router;
