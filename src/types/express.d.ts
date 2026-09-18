import { JwtUserPayload } from "../middlewares/auth.middleware"; // আপনার middleware থেকে payload import করুন

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

// এই খালি export টি আবশ্যক যাতে TS ফাইলটিকে Module হিসেবে ট্রিট করে
export {};
