
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import adminOverviewRoutes from "./modules/admin/overview/overview.routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Skill Exchange API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin/overview", adminOverviewRoutes);

// Centralized error handling (must be last)
app.use(errorMiddleware);

export default app;
