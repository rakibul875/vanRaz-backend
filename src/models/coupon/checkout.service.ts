import { Coupon } from "../coupon/coupon.model";
import { Product } from "../products/product.model";


interface ICheckoutItem {
  productId: string;
  quantity: number;
}

interface ICheckoutPayload {
  items: ICheckoutItem[];
  shippingAddress: {
    street: string;
    city: string;
    phone: string;
  };
  couponCode?: string;
}

export const validateCheckoutService = async (payload: ICheckoutPayload) => {
  const { items, shippingAddress, couponCode } = payload;

  // 1. Address Check
  if (
    !shippingAddress?.street ||
    !shippingAddress?.city ||
    !shippingAddress?.phone
  ) {
    throw new Error("Incomplete shipping address provided.");
  }

  // 2. Stock Validation & Subtotal Calculation
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(`Product not found with ID: ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      );
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    validatedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      itemTotal,
    });
  }

  // 3. Coupon Verification (if provided)
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await verifyCouponService(couponCode, subtotal);
    discount = coupon.discountAmount;
    appliedCoupon = coupon.code;
  }

  // Fixed or region-based shipping cost calculation
  const shippingCost = subtotal > 1000 ? 0 : 60;
  const grandTotal = Math.max(0, subtotal + shippingCost - discount);

  return {
    items: validatedItems,
    summary: {
      subtotal,
      shippingCost,
      discount,
      grandTotal,
      appliedCoupon,
    },
    shippingAddress,
  };
};

export const verifyCouponService = async (
  code: string,
  currentSubtotal: number,
) => {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid or expired coupon code.");
  }

  if (new Date() > coupon.expiresAt) {
    throw new Error("This coupon has expired.");
  }

  if (currentSubtotal < coupon.minOrderAmount) {
    throw new Error(
      `Minimum order amount for this coupon is BDT ${coupon.minOrderAmount}`,
    );
  }

  // Calculate percentage discount with max limit
  let discountAmount = (currentSubtotal * coupon.discountPercentage) / 100;
  if (discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  return {
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
    discountAmount,
  };
};
