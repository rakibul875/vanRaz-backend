import express from "express";
import {
  createProduct,
  getMyProducts,
  getSellerDashboardStats,
  updateProduct,
  updateStock,
} from "../../models/seller/product.controller";

const router = express.Router();
/**
 * @swagger
 * /api/v1/products/seller/create-product:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Seller Products
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
 *               - slug
 *               - description
 *               - images
 *               - price
 *               - stock
 *               - category
 *               - shop
 *               - seller
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wireless Headphones
 *               slug:
 *                 type: string
 *                 example: wireless-headphones
 *               description:
 *                 type: string
 *                 example: Premium noise-canceling headphones
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image.jpg"]
 *               price:
 *                 type: number
 *                 example: 150
 *               discount:
 *                 type: number
 *                 example: 10
 *               stock:
 *                 type: number
 *                 example: 50
 *               category:
 *                 type: string
 *                 example: 64f123456789a1b2c3d4e5f6
 *               shop:
 *                 type: string
 *                 example: 64f123456789a1b2c3d4e5f7
 *               seller:
 *                 type: string
 *                 example: 64f123456789a1b2c3d4e5f8
 *               brand:
 *                 type: string
 *                 example: Sony
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               isFlashSale:
 *                 type: boolean
 *                 example: true
 *               flashSalePrice:
 *                 type: number
 *                 example: 120
 *               flashSaleEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-31T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-product", createProduct);

/**
 * @swagger
 * /api/v1/products/seller/seller/:sellerId:
 *   get:
 *     summary: Get seller Products
 *     tags: [Seller Products]
 *     responses:
 *       200:
 *         description: products data retrieved successfully
 */
router.get("/seller/:sellerId", getMyProducts);

/**
 * @swagger
 * /api/v1/products/seller/seller-dashboard/:sellerId:
 *   get:
 *     summary: Get Seller Dashboard Stats
 *     tags: [Seller Products]
 *     responses:
 *       200:
 *         description: products data retrieved successfully
 */
router.get("/seller-dashboard/:sellerId", getSellerDashboardStats);

/**
 * @swagger
 * /api/v1/products/seller/:productId:
 *   patch:
 *     summary: Update Product
 *     tags:
 *       - Seller Products
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
router.patch("/:productId", updateProduct);

/**
 * @swagger
 * /api/v1/products/seller/update-stock/:productId:
 *   patch:
 *     summary: Update Stock
 *     tags:
 *       - Seller Products
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
router.patch("/update-stock/:productId", updateStock);

export const SellerProductRoutes = router;
