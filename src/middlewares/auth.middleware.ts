import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Session, User } from "../models/user/user.model";
import { UserRole } from "../models/user/user.interface";
import { createHash } from "node:crypto";

export interface JwtUserPayload extends JwtPayload {
  userId?: string;
  email?: string;
  role?: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export const authMiddleware = (
  ...requiredRoles: UserRole[]
): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      let token: string | undefined;
      
      // ১. Token এক্সট্রাক্ট করা
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        token = req.headers.authorization.split(" ")[1];
       
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      } else if (req.cookies?.["better-auth.session_token"]) {
        token = req.cookies["better-auth.session_token"];
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: "You are not authorized! Token is missing.",
        });
        return;
      }

      let userId: string | undefined;
      let userEmail: string | undefined;
      let decoded: JwtUserPayload | null = null;

      // ২. Session Check (Database)
      // Plain token এবং Hashed token দুটি দিয়েই চেক করা (Better-Auth Support-এর জন্য)
      const hashedToken = createHash("sha256").update(token).digest("hex");
      const sessionData = await Session.findOne({
        $or: [{ token: token }, { token: hashedToken }],
      }).populate("userId");

      // console.log(sessionData);
      if (sessionData) {
        // Expiry Check
        if (new Date() > new Date(sessionData.expiresAt)) {
          res.status(401).json({
            success: false,
            message: "Session has expired!",
          });
          return;
        }

        // Populated User extract করা
        if (sessionData.userId) {
          if (
            typeof sessionData.userId === "object" &&
            "_id" in sessionData.userId
          ) {
            const userObj = sessionData.userId as any;
            // console.log(userObj._id.toString());
            userId = userObj._id.toString();
            userEmail = userObj.email;
          } else {
            userId = sessionData.userId;
          }
        }
      } else {
        // ৩. Session না পেলে JWT Verify করা (Fallback)
        try {
          decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key",
          ) as JwtUserPayload;

          userId = decoded.userId || decoded.sub;
          userEmail = decoded.email;
        } catch (err) {
          // Token DB-তেও নেই, JWT-তেও Invalid
          res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token!",
          });
          return;
        }
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Invalid token payload!",
        });
        return;
      }

      // ৪. DB থেকে User Check & Blocked Status Check
      const user = await User.findById(userId).catch(() => null);
    
      if (user && user.status === "blocked") {
        res.status(403).json({
          success: false,
          message: "Your account has been blocked!",
        });
        return;
      }

      const role = (user?.role || decoded?.role || "user") as UserRole;

      // ৫. Role Authorization Check
      if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action!",
        });
        return;
      }
      // Request Object-এ User সেট করা
      req.user = {
        userId,
        email: user?.email || userEmail || "",
        role,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Authentication failed!",
      });
    }
  };
};
