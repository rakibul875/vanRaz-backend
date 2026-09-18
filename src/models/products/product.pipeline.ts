// src/app/modules/product/product.pipeline.ts
import { PipelineStage } from "mongoose";

export const getBaseProductPipeline = (
  matchCondition: Record<string, unknown> = {},
  sortCondition: Record<string, 1 | -1> = { createdAt: -1 },
  limitCount: number = 10,
): PipelineStage[] => {
  return [
    {
      $match: {
        isDeleted: { $ne: true },
        ...matchCondition,
      },
    },
    // Populate Category
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryLookup",
      },
    },
    { $unwind: { path: "$categoryLookup", preserveNullAndEmptyArrays: true } },
    // Populate Shop
    {
      $lookup: {
        from: "shops",
        localField: "shop",
        foreignField: "_id",
        as: "shopLookup",
      },
    },
    { $unwind: { path: "$shopLookup", preserveNullAndEmptyArrays: true } },
    // Populate Seller
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "sellerLookup",
      },
    },
    { $unwind: { path: "$sellerLookup", preserveNullAndEmptyArrays: true } },
    // Merge populated docs back into category/shop/seller, but keep the raw
    // ObjectId/string value when no referenced document exists (legacy backfill).
    {
      $addFields: {
        category: { $ifNull: ["$categoryLookup", "$category"] },
        shop: { $ifNull: ["$shopLookup", "$shop"] },
        seller: { $ifNull: ["$sellerLookup", "$seller"] },
      },
    },
    // Clean required fields
    {
      $project: {
        "seller.password": 0,
        "seller.role": 0,
        categoryLookup: 0,
        shopLookup: 0,
        sellerLookup: 0,
      },
    },
    { $sort: sortCondition },
    { $limit: limitCount },
  ];
};
