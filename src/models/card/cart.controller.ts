import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccessResponse } from "../../config/response";
import { CartServices } from "./cart.service";

const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const result = await CartServices.getCartFromDB(userId as string);
  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Cart retrieved successfully",
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CartServices.addToCartInDB(userId as string, req.body);

  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Product added to cart successfully",
    data: result,
  });
});

const updateCartQuantity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productId } = req.params;
  const result = await CartServices.updateCartQuantityInDB(
    userId as string,
    productId as string,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Cart item quantity updated successfully",
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productId } = req.params;
  const result = await CartServices.removeCartItemFromDB(
    userId as string,
    productId as string,
  );

  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Item removed from cart successfully",
    data: result,
  });
});

export const CartControllers = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeCartItem,
};
