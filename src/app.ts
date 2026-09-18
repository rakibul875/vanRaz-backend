import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import router from "./routes/index";
import { globalErrorHandler } from "./middlewares/error.middleware";


const app: Application = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger API Documentation Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// // Mount Shop routes from origin/main
// app.use("/api/v1/shops", ShopRoutes);
// app.use("/api/v1/categories", CategoryRoutes);
// app.use("/api/v1/products", productsRoutes);
// app.use("/api/v1/products/seller", SellerProductRoutes);
// app.use("/api/v1/orders", OrderRoutes);
// app.use("/api/v1/seller", SellerOrderRoutes);


// Root API Endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to VenRaz Multi-Vendor E-Commerce Backend API 🚀",
    documentation: "/api-docs",
  });
});

// Centralized Application Routes (/api/v1/...)
app.use("/api/v1", router);

// Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
