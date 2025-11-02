import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = Number(process.env.PORT ?? 5000);
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`[SERVER] Server is running on http://localhost:${PORT} 🚀`);
    });
  } catch (error) {
    console.error("[SERVER] Failed to start server:", error);
  }
};

startServer();
