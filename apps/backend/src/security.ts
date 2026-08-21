import type { RequestHandler } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const createRequireTrustedOrigin =
  (frontendOrigin: string): RequestHandler =>
  (request, response, next) => {
    if (SAFE_METHODS.has(request.method)) {
      next();
      return;
    }

    if (request.get("origin") !== frontendOrigin) {
      response.status(403).json({ error: "Request origin is not allowed" });
      return;
    }

    next();
  };
