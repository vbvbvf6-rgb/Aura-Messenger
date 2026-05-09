import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import http from "node:http";
import path from "node:path";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import router from "./routes";
import botApiRouter from "./routes/botapi";
import { logger } from "./lib/logger";

declare global {
  namespace Express {
    interface Request {
      currentUserId: number;
    }
  }
}

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => { throw new Error("JWT_SECRET must be set in production"); })()
    : "pulse-dev-jwt-secret-not-for-production");

const app: Express = express();

app.set("trust proxy", 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,      // tuned per-env below
    crossOriginEmbedderPolicy: false,  // needed for media/blobs
  }),
);

// Explicit safe headers on top of helmet defaults
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
// Reduced body limit — 2 MB is ample for a messenger API
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Broad limit on all API calls to prevent scraping/DoS
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: "Слишком много запросов. Повторите позже." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === "::1" || req.ip === "127.0.0.1",
});

// Tight limit on authentication endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Слишком много попыток входа. Подождите 15 минут." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === "::1" || req.ip === "127.0.0.1",
});

// Even tighter for password reset / 2FA
const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Слишком много попыток. Подождите 15 минут." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === "::1" || req.ip === "127.0.0.1",
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/2fa", sensitiveAuthLimiter);
app.use("/api/auth/password", sensitiveAuthLimiter);

// ── JWT authentication ────────────────────────────────────────────────────────
// Only a valid signed JWT grants access. The old x-user-id header bypass has
// been removed — it allowed any client to impersonate any user.
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.currentUserId = 0; // default = unauthenticated

  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId?: number; pending2fa?: boolean };
      // Reject pending-2FA tokens — they must be exchanged for a real token first
      if (!payload.pending2fa && Number.isFinite(payload.userId) && (payload.userId ?? 0) > 0) {
        req.currentUserId = payload.userId!;
      }
    } catch {
      // Invalid/expired token → stays unauthenticated (0)
    }
  }

  next();
});

app.use("/api", router);
app.use("/bot", botApiRouter);

if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(process.cwd(), "artifacts/pulse/dist/public");
  app.use(express.static(staticDir, { maxAge: "1h", index: false }));
  app.use("/{*path}", (_req: Request, res: Response) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  const VITE_PORT = 5000;
  app.use("/{*path}", (req: Request, res: Response) => {
    const options = {
      hostname: "localhost",
      port: VITE_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${VITE_PORT}` },
    };
    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxy.on("error", () => {
      res.status(502).send("Frontend не запущен. Запустите workflow 'Pulse Frontend'.");
    });
    req.pipe(proxy, { end: true });
  });
}

export default app;
