import { Router } from "express";
import { validateCheckout, verifyCoupon } from "./checkout.controller";

const router = Router();

/**
 * @openapi
 * /checkout/validate:
 *   post:
 *     summary: Validate checkout items, address, stock & calculate order summary
 *     tags:
 *       - Checkout & Coupons (Member 1)
 */
router.post("/validate", validateCheckout);

/**
 * @openapi
 * /coupons/verify:
 *   post:
 *     summary: Verify discount coupon code against subtotal
 *     tags:
 *       - Checkout & Coupons (Member 1)
 */
router.post("/verify", verifyCoupon);

export const CheckoutRoutes = router;
