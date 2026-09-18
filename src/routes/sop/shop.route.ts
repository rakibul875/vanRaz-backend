import express from "express";
import { createShop, updateMyShop } from "../../controllers/sop/shop.controller";
import { getAllShop } from "../../controllers/sop/shop.get.controller";
import { getMyShops } from "../../controllers/sop/shop.my.get.controller";
import { ReviewController } from "../../models/review/review.controller";

const router = express.Router();

/**
 * @swagger
 * /api/v1/shops/create-shop:
 *   post:
 *     summary: Create a new shop
 *     tags:
 *       - Shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - owner
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Fashion Shop
 *               owner:
 *                 type: string
 *                 example: 64f123456789
 *     responses:
 *       201:
 *         description: Shop created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-shop", createShop);

/**
 * @swagger
 * /api/v1/shops:
 *   get:
 *     summary: Get all shops
 *     tags:
 *       - Shop
 *     responses:
 *       200:
 *         description: Successfully retrieved all shops
 *       500:
 *         description: Server error
 */
router.get("/", getAllShop);

/**
 * @swagger
 * /api/v1/shops/my-shop/{ownerId}:
 *   get:
 *     summary: Get shops owned by a specific user
 *     tags:
 *       - Shop
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the owner
 *     responses:
 *       200:
 *         description: Successfully retrieved user shops
 *       404:
 *         description: No shops found for this owner
 */
router.get("/my-shop/:ownerId", getMyShops);

/**
 * @swagger
 * /api/v1/shops/update/my-shop/{ownerId}:
 *   patch:
 *     summary: update shops owned by a specific user
 *     tags:
 *       - Shop
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the owner
 *     responses:
 *       200:
 *         description: Successfully update user shops
 *       404:
 *         description: No shops found for this owner
 */
router.patch("/update/my-shop/:shopId", updateMyShop);

/**
 * @openapi
 * /api/v1/shops/{shopId}/products:
 *   get:
 *     summary: Get all products belonging to a specific shop (Public)
 *     tags:
 *       - Review System & Shop Products (Member 3)
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the shop
 *     responses:
 *       200:
 *         description: Successfully retrieved shop products
 *       400:
 *         description: Invalid shop ID format
 */
router.get("/:shopId/products", ReviewController.getShopProducts);

export const ShopRoutes = router;
