import { Types } from "mongoose";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import { IProductQuery, IProducts } from "./product.interface";
import { Product } from "./product.model";
import { Shop } from "../sop/sop.model";
import { getBaseProductPipeline } from "./product.pipeline";
import { parseSearchQueryWithAI } from "../../services/ai/ai.service";
import { AppError } from "../../utils/AppError";

// Active flash sale filter. flashSaleEndDate may be stored as a proper Date
// (created via API) or as an ISO string (seed data). $convert normalizes both
// so the $gt comparison works regardless of stored type.
export const activeFlashSaleFilter = () => ({
  isFlashSale: true,
  $expr: {
    $gt: [
      {
        $convert: {
          input: "$flashSaleEndDate",
          to: "date",
          onError: 0,
          onNull: 0,
        },
      },
      new Date(),
    ],
  },
});
// AI Search Service Import

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ICreateProductInput {
  payload: Partial<IProducts> & Record<string, unknown>;
  files: Express.Multer.File[];
  sellerId: string;
  shopId?: string;
  userId?: string;
}

/**
 * FormData থেকে আসা string মানগুলোকে যথাযথ টাইপে রূপান্তর করে
 */
const normalizeFormValue = (val: unknown): unknown => {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "" || val === null || val === undefined) return undefined;
  return val;
};

const normalizePayload = (
  payload: ICreateProductInput["payload"],
): Partial<IProducts> & Record<string, unknown> => {
  const normalized: Partial<IProducts> & Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    normalized[key] = normalizeFormValue(value);
    if (["price", "discount", "stock", "flashSalePrice"].includes(key)) {
      const num = Number(value);
      normalized[key] = Number.isFinite(num) ? num : undefined;
    }
    if (key === "flashSaleEndDate") {
      const date = value ? new Date(String(value)) : undefined;
      normalized[key] =
        date && !Number.isNaN(date.getTime()) ? date : undefined;
    }
  }
  return normalized;
};

/**
 * Cloudinary-এ ছবি upload করে (Auto Background Removal সাপোর্টেড না হলে fallback)
 */
const uploadImageToCloudinary = (
  file: Express.Multer.File,
): Promise<string> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("⚠️ Cloudinary keys not configured, skipping image upload");
    return Promise.resolve("");
  }

  return new Promise((resolve, reject) => {
    const attempt = (options: {
      folder: string;
      background_removal?: string;
    }) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            if (options.background_removal) {
              // Premium feature unsupported -> retry without it
              ordinaryUpload();
            } else {
              reject(error);
            }
            return;
          }
          resolve(result?.secure_url || "");
        },
      );
      stream.end(file.buffer);
    };

    const ordinaryUpload = () => attempt({ folder: "products" });
    attempt({ folder: "products", background_removal: "cloudinary_ai" });
  });
};

/**
 * 1. Create Product with Cloudinary Auto-Background Removal
 */
export const createProductIntoDB = async ({
  payload,
  files,
  sellerId,
  shopId,
  userId,
}: ICreateProductInput) => {
  const productData = normalizePayload(payload);

  if (!productData.name || !productData.name.trim()) {
    throw new AppError("Product name is required", 400);
  }

  // Unique slug generate
  let slug = slugify(String(productData.name), { lower: true, strict: true });
  if (!slug) slug = `product-${Date.now()}`;
  while (await Product.exists({ slug })) {
    slug = `${slugify(String(productData.name), {
      lower: true,
      strict: true,
    })}-${Math.random().toString(36).slice(2, 7)}`;
  }
  productData.slug = slug;

  // Upload images (if uploaded)
  const imageUrls: string[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const url = await uploadImageToCloudinary(file);
      if (url) imageUrls.push(url);
    }
  }

  const existingImages: string[] = Array.isArray(productData.images)
    ? (productData.images as string[]).filter(Boolean)
    : [];
  const images = [...existingImages, ...imageUrls];
  if (images.length === 0) {
    throw new AppError("At least one product image is required", 400);
  }
  productData.images = images;
  productData.description = productData.description || productData.name;

  // category resolve (required ObjectId)
  const categoryValue = productData.category;
  if (
    typeof categoryValue !== "string" ||
    !Types.ObjectId.isValid(categoryValue)
  ) {
    throw new AppError("A valid category ID is required", 400);
  }
  productData.category = new Types.ObjectId(categoryValue);

  // seller resolve
  const seller =
    sellerId && Types.ObjectId.isValid(sellerId) ? sellerId : userId;
  if (!seller || !Types.ObjectId.isValid(seller)) {
    throw new AppError("Seller is not authenticated", 401);
  }
  productData.seller = new Types.ObjectId(seller);

  // shop resolve (body -> owner's shop -> fail)
  if (shopId && Types.ObjectId.isValid(shopId)) {
    productData.shop = new Types.ObjectId(shopId as string);
  } else {
    const shop = await Shop.findOne({ ownerId: seller as string });
    if (shop) {
      productData.shop = shop._id;
    }
  }
  if (!productData.shop) {
    throw new AppError(
      "Shop not found for this seller. Create a shop first.",
      400,
    );
  }

  return await Product.create(productData);
};

/**
 * 2. Get All Products with Normal + AI Smart Search Support
 */

export const getAllProductsFromDB = async (
  query: IProductQuery & { useAI?: string; userFrequentCategory?: string },
) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    useAI,
    userFrequentCategory,
  } = query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.max(1, Number(limit));
  const skip = (pageNumber - 1) * limitNumber;

  const matchConditions: Record<string, unknown> = {
    isDeleted: { $ne: true },
  };

  let searchKeyword = search;
  let targetCategory = category;
  let targetBrand = "";
  let computedExactPrice: number | null = null;
  let computedMinPrice = minPrice;
  let computedMaxPrice = maxPrice;

  // AI Smart Search সক্রিয় থাকলে
  if (search && useAI === "true") {
    const aiParsed = await parseSearchQueryWithAI(search);

    if (aiParsed.searchKeyword !== undefined)
      searchKeyword = aiParsed.searchKeyword;
    if (aiParsed.category && !targetCategory)
      targetCategory = aiParsed.category;
    if (aiParsed.brand) targetBrand = aiParsed.brand;
    if (aiParsed.exactPrice) computedExactPrice = Number(aiParsed.exactPrice);
    if (aiParsed.minPrice && !computedMinPrice)
      computedMinPrice = String(aiParsed.minPrice);
    if (aiParsed.maxPrice && !computedMaxPrice)
      computedMaxPrice = String(aiParsed.maxPrice);
  }

  // 🎯 ১. টেক্সট ও নাম্বার সার্চ সমন্বয় (FIXED FOR APPLE MACBOOK)
  if (searchKeyword && searchKeyword.trim() !== "") {
    const trimmed = searchKeyword.trim();
    const cleanNumberSearch = trimmed.replace(/[^0-9.]/g, "");
    const numericValue = Number(cleanNumberSearch);
    const isNumber = cleanNumberSearch !== "" && !isNaN(numericValue);

    // ইনপুট স্ট্রিংকে স্পেস দিয়ে শব্দে বিভক্ত করা (e.g. "macbook" বা "apple macbook")
    const keywords = trimmed.split(/\s+/).filter(Boolean);

    // প্রতিটি শব্দের জন্য dynamic regex pattern (Case-Insensitive 'i')
    const keywordRegexes = keywords.map((kw) => new RegExp(kw, "i"));

    // Title/Name, Description, Brand, Tags সবখানে চেক
    const wordMatches = keywordRegexes.map((word) => ({
      $or: [
        { name: { $regex: word, $options: "i" } },
        { title: { $regex: word, $options: "i" } }, // Schema-তে title থাকলেও যেন ম্যাচ করে
        { description: { $regex: word, $options: "i" } },
        { brand: { $regex: word, $options: "i" } },
        { tags: { $regex: word, $options: "i" } },
      ],
    }));

    const orConditions: any[] = [
      // ১. নাম/Title, Description, Brand, Tags-এ শব্দের উপস্থিতি চেক
      { name: { $in: keywordRegexes } },
      { title: { $in: keywordRegexes } },
      { brand: { $in: keywordRegexes } },
      { description: { $in: keywordRegexes } },
      { tags: { $in: keywordRegexes } },

      // ২. সম্পূর্ণ বাক্যাংশ হিসেবে চেক করা (অতিরিক্ত নিরাপত্তার জন্য)
      { name: { $regex: trimmed, $options: "i" } },
      { title: { $regex: trimmed, $options: "i" } },
      { brand: { $regex: trimmed, $options: "i" } },

      // ৩. প্রতিটি শব্দকে আলাদাভাবে Match করানোর জন্য $and array
      {
        $and: keywords.map((kw) => ({
          $or: [
            { name: { $regex: kw, $options: "i" } },
            { title: { $regex: kw, $options: "i" } },
            { brand: { $regex: kw, $options: "i" } },
            { description: { $regex: kw, $options: "i" } },
          ],
        })),
      },
    ];

    // ইউজার যদি সংখ্যা বা টাকার অ্যামাউন্ট দিয়ে সার্চ করে
    if (computedExactPrice) {
      orConditions.push({ price: computedExactPrice });
    } else if (isNumber) {
      orConditions.push({
        price: {
          $gte: Math.floor(numericValue * 0.8),
          $lte: Math.ceil(numericValue * 1.2),
        },
      });
    }

    matchConditions.$or = orConditions;
  }

  // ২. ব্র্যান্ড ফিল্টারিং
  if (targetBrand) {
    matchConditions.brand = { $regex: new RegExp(`^${targetBrand}$`, "i") };
  }

  // ৩. ক্যাটাগরি ফিল্টারিং
  if (targetCategory) {
    if (Types.ObjectId.isValid(targetCategory)) {
      // Stored values may be ObjectId (new products) or legacy string -> match both
      matchConditions.category = {
        $in: [new Types.ObjectId(targetCategory), targetCategory],
      };
    } else {
      // Products store category as a name string -> regex match (also covers slug-ish input)
      matchConditions.category = {
        $regex: new RegExp(targetCategory, "i"),
      };
    }
  }

  // ৪. এক্সপ্লিসিট প্রাইস রেঞ্জ ফিল্টারিং
  if (!computedExactPrice && (computedMinPrice || computedMaxPrice)) {
    const priceCondition: Record<string, number> = {};
    if (computedMinPrice) priceCondition.$gte = Number(computedMinPrice);
    if (computedMaxPrice) priceCondition.$lte = Number(computedMaxPrice);
    matchConditions.price = priceCondition;
  }

  // সোর্টিং কনফিগারেশন
  let sortCondition: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price-asc") sortCondition = { price: 1 };
  else if (sort === "price-desc") sortCondition = { price: -1 };

  // Personalized Category Preference Sorting
  if (userFrequentCategory && Types.ObjectId.isValid(userFrequentCategory)) {
    sortCondition = { userPreferenceScore: -1, ...sortCondition };
  }

  // পাইপলাইন তৈরি
  const pipeline: any[] = [];

  // Personalized Category Score স্টেজ যুক্ত করা (যদি থাকে)
  if (userFrequentCategory && Types.ObjectId.isValid(userFrequentCategory)) {
    pipeline.push({
      $addFields: {
        userPreferenceScore: {
          $cond: {
            if: {
              $eq: ["$category", new Types.ObjectId(userFrequentCategory)],
            },
            then: 1,
            else: 0,
          },
        },
      },
    });
  }

  // বেস পাইপলাইন মার্জ করা
  pipeline.push(
    ...getBaseProductPipeline(matchConditions, sortCondition, 100000),
  );

  // ফাইনাল Facet (Pagination & Meta) যুক্ত করা
  pipeline.push({
    $facet: {
      meta: [{ $count: "total" }],
      data: [{ $skip: skip }, { $limit: limitNumber }],
    },
  });

  const result = await Product.aggregate(pipeline);

  return {
    products: result[0]?.data || [],
    totalProducts: result[0]?.meta[0]?.total || 0,
    totalPages: Math.ceil((result[0]?.meta[0]?.total || 0) / limitNumber),
    currentPage: pageNumber,
  };
};
/**
 * 3. Single Product Helper
 */
const getSingleProductFromDB = async (productId: string) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid Product ID format");
  }

  const pipeline = getBaseProductPipeline(
    { _id: new Types.ObjectId(productId) },
    { createdAt: -1 },
    1,
  );

  const result = await Product.aggregate(pipeline);

  if (!result || result.length === 0) {
    throw new Error("Product not found");
  }

  return result[0];
};

export const getFlashSaleProducts = async (query: Record<string, unknown>) => {
  const matchCondition: Record<string, unknown> = {};

  // Check if isFlashSale query parameter is passed
  if (query.isFlashSale !== undefined) {
    matchCondition.isFlashSale = query.isFlashSale === "true";
  }

  // Sort and Limit dynamic framing
  const limitCount = Number(query.limit) || 10;
  const sortCondition: Record<string, 1 | -1> =
    query.sortBy === "price" ? { price: 1 } : { createdAt: -1 };

  // Generate Mongoose aggregate pipeline
  const pipeline = getBaseProductPipeline(
    matchCondition,
    sortCondition,
    limitCount,
  );

  const result = await Product.aggregate(pipeline);
  return result;
};

const getTopRatedProducts = async (limit = 10) => {
  return await Product.aggregate(
    getBaseProductPipeline({}, { rating: -1 }, limit),
  );
};

const getNewArrivalProducts = async (limit = 10) => {
  return await Product.aggregate(
    getBaseProductPipeline({}, { createdAt: -1 }, limit),
  );
};

const getHomeSections = async () => {
  const [featured, flashSale, topRated, mostSelling, newArrivals] =
    await Promise.all([
      Product.aggregate(
        getBaseProductPipeline({ isFeatured: true }, { createdAt: -1 }, 8),
      ),
      Product.aggregate(
        getBaseProductPipeline(
          activeFlashSaleFilter(),
          { createdAt: -1 },
          8,
        ),
      ),
      Product.aggregate(getBaseProductPipeline({}, { rating: -1 }, 8)),
      Product.aggregate(getBaseProductPipeline({}, { soldQuantity: -1 }, 8)),
      Product.aggregate(getBaseProductPipeline({}, { createdAt: -1 }, 8)),
    ]);

  return {
    featured,
    flashSale,
    topRated,
    mostSelling,
    newArrivals,
  };
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  getFlashSaleProducts,
  getTopRatedProducts,
  getNewArrivalProducts,
  getHomeSections,
};
