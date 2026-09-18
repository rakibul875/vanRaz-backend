import { Router } from "express";
import { getSellerOrders, updateOrderStatus } from "./sellerOrder.controller";

const router = Router();
/**
 * @swagger
 * /api/v1/seller/orders:
 *   get:
 *     summary: Get seller orders
 *     tags: [Seller Orders Controller]
 *     responses:
 *       200:
 *         description: products data retrieved successfully
 */
router.get("/orders", getSellerOrders);
/**
 * @swagger
 * /api/v1/seller/orders/:orderId/status:
 *   patch:
 *     summary: Update Order Status
 *     tags:
 *       - Seller Orders Controller
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the owner
 *     responses:
 *       200:
 *         description: Successfully update seller products
 *       404:
 *         description: No products found for this owner
 */
router.patch("/orders/:orderId/status", updateOrderStatus);

export const SellerOrderRoutes = router;
