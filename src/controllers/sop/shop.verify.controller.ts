import { Request, Response } from "express";
import { verifyShop, ShopVerificationInput } from "../../services/shopVerification";

export const verifyShopController = async (req: Request, res: Response) => {
  try {
    const input: ShopVerificationInput = {
      shopName: req.body.shopName || "",
      description: req.body.description || "",
      address: req.body.address || "",
      phone: req.body.phone || "",
      logoUrl: req.body.logoUrl || "",
      bannerUrl: req.body.bannerUrl || "",
      ownerName: req.body.ownerName || "",
    };

    const result = verifyShop(input);

    res.status(200).json({
      success: true,
      message: "Shop verification completed",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};
