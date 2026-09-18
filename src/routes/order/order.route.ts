// order.route.ts
import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  trackOrder,
  syncGuestOrders,
} from "../../models/order/order.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /api/v1/orders/track/{trackingId}:
 *   get:
 *     summary: Track order by tracking ID (Public)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         example: TRK-2026-987654
 *     responses:
 *       200:
 *         description: Order tracking information retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get("/track/:trackingId", trackOrder);
// order.route.ts
router.post("/sync-guest-orders", authMiddleware(), syncGuestOrders);
/**
 * @openapi
 * api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post(
  "/",
  authMiddleware("user", "moderator", "admin"),
  // roleMiddleware("user", "moderator", "admin"),
  createOrder,
);

/**
 * @openapi
 * /api/v1/orders/my-orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders fetched successfully
 */
router.get(
  "/my-orders",
  authMiddleware("user", "moderator", "admin"),
  // roleMiddleware("user", "moderator", "admin"),
  getMyOrders,
);

/**
 * @openapi
 * /api/v1/orders/{orderId}:
 *   get:
 *     summary: Get single order by ID
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 */
router.get(
  "/:orderId",
  authMiddleware(),
  roleMiddleware("user", "moderator", "admin"),
  getSingleOrder,
);

/**
 * @openapi
 * /api/v1/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.patch(
  "/:orderId/cancel",
  authMiddleware(),
  roleMiddleware("user", "moderator", "admin"),
  cancelOrder,
);

export const OrderRoutes = router;
