import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { milestonesRouter } from "./routes/milestones.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const clientDistPath = path.resolve(currentDirectoryPath, "../../client/dist");

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"],
      methods: ["GET", "POST"]
    })
  );
  app.use(express.json({ limit: "32kb" }));
  app.use(morgan("dev"));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/milestones", milestonesRouter);

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get("*", (request, response, next) => {
      if (request.path.startsWith("/milestones") || request.path === "/health") {
        next();
        return;
      }

      response.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
    console.error(error);
    response.status(500).json({
      message: "The server hit an unexpected error. Please try again."
    });
  });

  return app;
}
