import { Request, Response } from "express";
import { createShopIntoDB } from "../../services/sop/shop.service";
import { Shop } from "../../models/sop/sop.model";

export const createShop = async (req: Request, res: Response) => {
  try {
    const shopData = req.body;
    const result = await createShopIntoDB(shopData);
    // console.log(result, req.body);
    res.status(201).json({
      success: true,
      message: "Shop and Collection created successfully!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create shop",
      error,
    });
  }
};

export const updateMyShop = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const updateData = req.body;

    const updatedShop = await Shop.findByIdAndUpdate(shopId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedShop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this user!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully!",
      data: updatedShop,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update shop",
      error: error.message,
    });
  }
};
