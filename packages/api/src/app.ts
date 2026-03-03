import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { health } from "./routes/health.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(",");
      return allowed.includes(origin) ? origin : allowed[0];
    },
  }),
);

app.onError(errorHandler);

app.route("/api/v1/health", health);

export { app };
