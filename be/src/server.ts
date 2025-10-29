import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`[SERVER] Server is running on http://localhost:${PORT} 🚀`);
    });
  } catch (error) {
    console.error("[SERVER] Failed to start server:", error);
  }
};
("");

startServer();
