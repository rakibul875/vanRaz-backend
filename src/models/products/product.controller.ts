import { Request, Response } from "express";
import { ProductServices, activeFlashSaleFilter } from "./product.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccessResponse } from "../../config/response";
import { getBaseProductPipeline } from "./product.pipeline";
import { Product } from "./product.model";

export const createProducts = catchAsync(
  async (req: Request, res: Response) => {
    const productData = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    // Authenticated user/seller information (req.user middleware থেকে প্রাপ্ত)
    const userId = req.user?.userId || productData.seller || "";
    const sellerId = userId;
    const shopId = productData.shopId || productData.shop || "";
    // console.log(productData);
    const result = await ProductServices.createProductIntoDB({
      payload: productData,
      files,
      sellerId,
      shopId,
      userId,
    });

    sendSuccessResponse(res, {
      statusCode: 201,
      message: "Product and Collection created successfully!",
      data: result,
    });
  },
);

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getAllProductsFromDB(req.query);
  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Products retrieved successfully",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await ProductServices.getSingleProductFromDB(
    productId as string,
  );

  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Product details retrieved successfully",
    data: result,
  });
});

const getHomeSections = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getHomeSections();
  // console.log(result);
  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Home section products retrieved successfully",
    data: result,
  });
});

const getFlashSaleProducts = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;

    // Explicitly add flash sale filter condition.
    // Handles both Date type and ISO string stored flashSaleEndDate values.
    const matchCondition = activeFlashSaleFilter();

    const pipeline = getBaseProductPipeline(
      matchCondition,
      { createdAt: -1 },
      limit,
    );

    const result = await Product.aggregate(pipeline);
    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Flash sale products retrieved successfully",
      data: result,
    });
  },
);

const getTopRatedProducts = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const result = await ProductServices.getTopRatedProducts(limit);
  sendSuccessResponse(res, {
    statusCode: 200,
    message: "Top rated products retrieved successfully",
    data: result,
  });
});

const getNewArrivalProducts = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const result = await ProductServices.getNewArrivalProducts(limit);
    sendSuccessResponse(res, {
      statusCode: 200,
      message: "New arrival products retrieved successfully",
      data: result,
    });
  },
);

export const ProductControllers = {
  createProducts,
  getAllProducts,
  getSingleProduct,
  getHomeSections,
  getFlashSaleProducts,
  getTopRatedProducts,
  getNewArrivalProducts,
};
