import { AdminRoutes } from "../models/admin/admin.route";

import { Router } from "express";
import { UserRoutes } from "../models/user/user.route";
import { WishlistRoutes } from "../models/wishlist/wishlist.route";
import { ReviewRoutes } from "../models/review/review.route";
import { AddressRoutes } from "../models/address/address.route";
import { RecentViewRoutes } from "../models/recentView/recentView.route";
import { ShopRoutes } from "./sop/shop.route";
import { ShopVerifyRoutes } from "./sop/shop.verify.route";
import { CategoryRoutes } from "./category/category.route";
import { productsRoutes } from "./products/product.route";
import { SellerProductRoutes } from "./seller/product.route";
import { OrderRoutes } from "./order/order.route";
import { CartRoutes } from "./card/cart.route";
import { CheckoutRoutes } from "../models/coupon/checkout.routes";
import { AIRoutes } from "../services/ai/ai.routes";
import { ChatRoutes } from "./chat/chat.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/admin",
    route: AdminRoutes,
  },

  { path: "/users", route: UserRoutes },
  { path: "/users/address", route: AddressRoutes },
  { path: "/users/recent-views", route: RecentViewRoutes },
  { path: "/shops/verify", route: ShopVerifyRoutes },
  { path: "/shops", route: ShopRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/products/seller", route: SellerProductRoutes },
  { path: "/products", route: productsRoutes },
  { path: "/checkout", route: CheckoutRoutes },
  { path: "/coupons", route: CheckoutRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/cart", route: CartRoutes },
  { path: "/wishlist", route: WishlistRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/ai", route: AIRoutes },
  {
    path: "/chat",
    route: ChatRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
