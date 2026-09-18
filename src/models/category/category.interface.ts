// // src/app/modules/category/category.interface.ts
import { Model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
}

export type CategoryModel = Model<ICategory>;
