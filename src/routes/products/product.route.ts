import express from "express";
import {
  createProducts,
  ProductControllers,
} from "../../models/products/product.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
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
router.post("/", authMiddleware(), upload.array("images", 8), createProducts);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products with search, filtering, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword (matches name, description, or brand)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ObjectId
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price-asc, price-desc, rating, oldest]
 *         description: Sorting criteria
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", ProductControllers.getAllProducts);

// export const ProductRoutes = router;

/**
 * @swagger
 * /api/v1/products/home-sections:
 *   get:
 *     summary: Get all home page sections (Featured, Flash Sale, Top Rated, Most Selling, New Arrivals)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Home page sections data retrieved successfully
 */
router.get("/home-sections", ProductControllers.getHomeSections);

/**
 * @swagger
 * /api/v1/products/flash-sale:
 *   get:
 *     summary: Get flash sale products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to retrieve
 *     responses:
 *       200:
 *         description: Flash sale products retrieved successfully
 */
router.get("/flash-sale", ProductControllers.getFlashSaleProducts);

/**
 * @swagger
 * /api/v1/products/top-rated:
 *   get:
 *     summary: Get top rated products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top rated products retrieved successfully
 */
router.get("/top-rated", ProductControllers.getTopRatedProducts);

/**
 * @swagger
 * /api/v1/products/new-arrivals:
 *   get:
 *     summary: Get new arrival products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: New arrival products retrieved successfully
 */
router.get("/new-arrivals", ProductControllers.getNewArrivalProducts);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   get:
 *     summary: Get product details by ID (Populated with Shop, Category, and Seller)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique product ObjectId
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/:productId", ProductControllers.getSingleProduct);

export const productsRoutes = router;
