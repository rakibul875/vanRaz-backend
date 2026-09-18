import express from "express";
import { verifyShopController } from "../../controllers/sop/shop.verify.controller";

const router = express.Router();

/**
 * @swagger
 * /api/v1/shops/verify:
 *   post:
 *     summary: Run AI verification on shop registration data
 *     tags:
 *       - Shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopName
 *               - description
 *               - phone
 *               - address
 *               - ownerName
 *             properties:
 *               shopName:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               bannerUrl:
 *                 type: string
 *               ownerName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification result with status, trustScore, enhancedData, and feedback
 *       500:
 *         description: Server error
 */
router.post("/", verifyShopController);

export const ShopVerifyRoutes = router;
