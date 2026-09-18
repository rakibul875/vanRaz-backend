import { Request, Response } from "express";
import {
  validateCheckoutService,
  verifyCouponService,
} from "./checkout.service";

export const validateCheckout = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await validateCheckoutService(data);
    return res.status(200).json({
      success: true,
      message: "Checkout validation successful.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Checkout validation failed.",
    });
  }
};

export const verifyCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof subtotal !== "number") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Coupon code and subtotal are required.",
        });
    }

    const result = await verifyCouponService(code, subtotal);
    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to apply coupon.",
    });
  }
};
