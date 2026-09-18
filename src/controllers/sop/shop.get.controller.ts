import { Request, Response } from "express";
import { Shop } from "../../models/sop/sop.model";
export const getAllShop = async (req: Request, res: Response) => {
  try {
    const shops = await Shop.find();
    // console.log(shops);
    return res.status(200).json({
      success: true,
      message: "Shops fetched successfully!",
      data: shops,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shops",
      error: error.message,
    });
  }
};
