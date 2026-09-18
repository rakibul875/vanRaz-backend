import { Router } from "express";
import { generateDescription } from "./ai.controller";

const router = Router();

/**
 * @openapi
 * /ai/generate-description:
 *   post:
 *     summary: Generate AI product description and highlights
 *     tags:
 *       - AI Features
 */
router.post("/generate-description", generateDescription);

export const AIRoutes = router;
