import { getAuth } from "@clerk/express";
import type { RequestHandler, Request } from "express";

type AuthenticatedRequest = Request & { clerkUserId: string };

export const requireAuth: RequestHandler = (req, res, next) => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign-in required" });
    return;
  }

  (req as AuthenticatedRequest).clerkUserId = userId;
  next();
};

export function getClerkUserId(req: Request): string {
  return (req as AuthenticatedRequest).clerkUserId;
}
