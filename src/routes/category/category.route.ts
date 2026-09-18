import express from "express";
import { CategoryControllers } from "../../models/category/category.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 */
router.get("/", CategoryControllers.getAllCategories);

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a new category (Admin Only)
 *     tags: [Category]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Gadgets and accessories
 *               icon:
 *                 type: string
 *                 example: https://example.com/icon.png
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin access required)
 */
router.post("/", authMiddleware("admin"), CategoryControllers.createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     summary: Update a category (Admin Only)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.patch(
  "/:id",
  authMiddleware("admin"),
  CategoryControllers.updateCategory,
);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin Only)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete(
  "/:id",
  authMiddleware("admin"),
  CategoryControllers.deleteCategory,
);

export const CategoryRoutes = router;
