import { Request, Response } from "express";
import { Order } from "../order/order.model";

export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required.",
      });
    }

    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "name price images seller shop",
        match: { seller: sellerId },
      })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    const sellerOrders = orders.filter((order) =>
      order.items.some((item) => item.product !== null),
    );

    res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully",
      data: sellerOrders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value provided.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status for a cancelled order.",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}' successfully`,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
