// src/app/modules/category/category.service.ts
import slugify from "slugify";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import { AppError } from "../../utils/AppError";

const createCategoryIntoDB = async (payload: ICategory) => {
  const isCategoryExist = await Category.findOne({ name: payload.name });
  if (isCategoryExist) {
    throw new AppError("Category with this name already exists", 400);
  }

  // Automatic Slug Generation
  payload.slug = slugify(payload.name, { lower: true, strict: true });

  const result = await Category.create(payload);
  return result;
};

const getAllCategoriesFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };

  // Public home page only gets active categories if specified
  if (query.activeOnly === "true") {
    filter.isActive = true;
  }

  const result = await Category.find(filter).sort({ createdAt: -1 });
  return result;
};

const updateCategoryInDB = async (id: string, payload: Partial<ICategory>) => {
  const isCategoryExist = await Category.findById(id);
  if (!isCategoryExist) {
    throw new AppError("Category not found", 404);
  }

  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const isCategoryExist = await Category.findById(id);
  if (!isCategoryExist) {
    throw new AppError("Category not found", 404);
  }

  // Soft Delete
  const result = await Category.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
