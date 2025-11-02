import express, { Express, Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import errorHandler from "./middlewares/errorHandler";

const app: Express = express();

app.use("/assets", express.static("public/assets"));

// CORS Config
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "ConvoHub API is running!" });
});

// API Routes
app.use("/api", userRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
