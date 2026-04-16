import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import { router as routes } from "./routes/index.js";
import { globalLimiter } from "./middlewares/rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5176",
  "http://127.0.0.1:5176",
];

const getAllowedOrigins = () => {
  if (!process.env.CORS_ORIGIN) return defaultAllowedOrigins;

  return process.env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const createApp = () => {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.disable("x-powered-by");

  app.use(helmet());
  app.use(globalLimiter);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize({ replaceWith: "_" }));
  app.use(express.static(path.join(__dirname, "../public")));

  app.use("/api", routes);

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((error, req, res, next) => {
    if (error?.message === "Not allowed by CORS") {
      return res
        .status(403)
        .json({ message: "CORS policy blocked this origin" });
    }

    console.error("Unhandled error:", error);

    const isProduction = process.env.NODE_ENV === "production";
    const status = error.status || 500;
    const message = isProduction
      ? "An unexpected error occurred. Please try again later."
      : error.message || "Unexpected server error";

    return res.status(status).json({
      message,
      ...(isProduction ? {} : { stack: error.stack }),
    });
  });

  return app;
};
