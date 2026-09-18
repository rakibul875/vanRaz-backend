import { Types } from "mongoose";
import { Cart } from "./cart.model";
import { Product } from "../products/product.model";
import {
  IAddToCartPayload,
  IUpdateCartQuantityPayload,
} from "./cart.interface";

const getCartFromDB = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name images price discount stock shop status isDeleted",
    populate: {
      path: "shop",
      select: "name status",
    },
  });

  if (!cart) {
    cart = await Cart.create({
      user: new Types.ObjectId(userId),
      items: [],
      totalPrice: 0,
    });
  }

  return cart;
};

const addToCartInDB = async (userId: string, payload: IAddToCartPayload) => {
  const { productId, quantity = 1 } = payload;

  const product = await Product.findOne({
    _id: productId,
    isDeleted: { $ne: true },
    status: "approved",
  });

  if (!product) {
    throw new Error("Product not found or unavailable!");
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock! Available: ${product.stock}`);
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: new Types.ObjectId(userId),
      items: [],
      totalPrice: 0,
    });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (product.stock < newQuantity) {
      throw new Error(
        `Cannot add more. Exceeds available stock (${product.stock})`,
      );
    }
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    cart.items.push({
      product: new Types.ObjectId(productId),
      quantity,
      price: product.price - (product.discount || 0),
    });
  }

  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  await cart.save();

  return cart.populate({
    path: "items.product",
    select: "name images price discount stock",
  });
};

const updateCartQuantityInDB = async (
  userId: string,
  productId: string,
  payload: IUpdateCartQuantityPayload,
) => {
  const { quantity } = payload;

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found!");
  }

  if (product.stock < quantity) {
    throw new Error(
      `Insufficient stock! Maximum available stock is ${product.stock}`,
    );
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found!");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart!");
  }

  cart.items[itemIndex].quantity = quantity;

  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  await cart.save();
  return cart.populate({
    path: "items.product",
    select: "name images price discount stock",
  });
};

const removeCartItemFromDB = async (userId: string, productId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found!");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  await cart.save();
  return cart.populate({
    path: "items.product",
    select: "name images price discount stock",
  });
};

export const CartServices = {
  getCartFromDB,
  addToCartInDB,
  updateCartQuantityInDB,
  removeCartItemFromDB,
};
