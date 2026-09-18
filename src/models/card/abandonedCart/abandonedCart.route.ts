import express, { Request, Response } from "express";
import { trackAbandonedCartService } from "./abandonedCart.service";

const router = express.Router();

router.post("/track", async (req: Request, res: Response) => {
  try {
    const cart = await trackAbandonedCartService(req.body);
    console.log("Req Body Data:", req.body, cart);
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
});

export const AbandonedCartRoutes = router;
