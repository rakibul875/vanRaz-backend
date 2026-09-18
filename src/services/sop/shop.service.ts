import { Shop } from "../../models/sop/sop.model";
import { IShop } from "../../types/sop/sop";

export const createShopIntoDB = async (payload: IShop) => {
  const result = await Shop.create(payload);
  return result;
};
