import { Request, Response } from "express";
import { Shop } from "../../models/sop/sop.model";

export const getMyShops = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const shop = await Shop.findOne({ ownerId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this user!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "My shop fetched successfully!",
      data: shop,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my shop",
      error: error.message,
    });
  }
};
