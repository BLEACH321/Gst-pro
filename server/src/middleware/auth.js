import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "gst_sahayak_secret_key_2026";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // For seamless demo operation if no token sent, default to the demo user
      const demoUser = await prisma.user.findFirst({
        include: { business: true }
      });
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { business: true }
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    // If token invalid, fallback to demo user for demo resilience
    const demoUser = await prisma.user.findFirst({
      include: { business: true }
    });
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ error: "Invalid or expired authorization token" });
  }
}
