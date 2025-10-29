import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

const app: Express = express();
app.use(
  cors({
    origin:
      process.env["NODE_ENV"] === "production"
        ? process.env["FRONTEND_URL"]
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "ConvoHub API is running!" });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.stack);
  res.status(500).json({
    success: false,
    message:
      process.env["NODE_ENV"] === "production"
        ? "An error occurred on the server"
        : err.message,
    ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
  });
});

export default app;
