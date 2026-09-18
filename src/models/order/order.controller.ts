import { Request, Response } from "express";
import { Order } from "./order.model";
import { generateTrackingId } from "./generateTrackingId";
import { authMiddleware } from "../../middlewares/auth.middleware";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || null;
    const { items, totalAmount, shippingAddress, paymentMethod, email } =
      req.body;
    const trackingId = generateTrackingId();

    const newOrder = await Order.create({
      user: userId,
      guestEmail: userId ? undefined : email, // Guest হলে ইমেইল সেভ থাকবে
      trackingId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// order.controller.ts
export const syncGuestOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const email = req.user?.email;

    if (!userId || !email) {
      return res
        .status(400)
        .json({ success: false, message: "User info missing" });
    }

    const result = await Order.updateMany(
      { guestEmail: email.toLowerCase(), user: null },
      { $set: { user: userId } },
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} guest orders synced successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;
    // console.log(orderId, userId);
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.product",
      "name price images brand",
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.status}' state.`,
      });
    }

    order.status = "cancelled";
    order.isCancelled = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;

    const order = await Order.findOne({ trackingId })
      .select(
        "trackingId status items totalAmount shippingAddress createdAt updatedAt",
      )
      .populate("items.product", "name images");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Tracking ID" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
