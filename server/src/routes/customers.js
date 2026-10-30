import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import {
  validateGstinFormat,
  verifyGstinWithProvider
} from "../services/gstVerificationService.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/customers - List customers for authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" }
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer directory" });
  }
});

// POST /api/customers/verify-gstin - Verify customer GSTIN and retrieve business details
router.post("/verify-gstin", authMiddleware, async (req, res) => {
  try {
    const { gstin } = req.body;
    if (!gstin || typeof gstin !== "string") {
      return res.status(400).json({ error: "Customer GSTIN is required" });
    }

    const normalized = gstin.trim().toUpperCase();

    // 1. Format & Mod-36 check
    const format = validateGstinFormat(normalized);
    if (!format.isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer GSTIN format. Please check the GSTIN and try again.",
        formatDetails: format
      });
    }

    // 2. Registration Verification
    const verification = await verifyGstinWithProvider(normalized);

    if (verification.status === "API_UNAVAILABLE") {
      return res.status(503).json({
        success: false,
        error: "GSTIN verification is temporarily unavailable. Please try again later."
      });
    }

    if (verification.status === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Customer GSTIN could not be verified. Please check the number."
      });
    }

    return res.json({
      success: true,
      verification,
      message: "Customer GSTIN verified successfully."
    });
  } catch (err) {
    console.error("Customer GSTIN verification error:", err);
    res.status(500).json({ error: "Customer GSTIN verification failed: " + err.message });
  }
});

// POST /api/customers - Create new customer
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, gstin, state, address, email, phone } = req.body;
    if (!name || !state) {
      return res.status(400).json({ error: "Customer name and state are required." });
    }

    const customer = await prisma.customer.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        gstin: gstin ? gstin.toUpperCase().trim() : null,
        state: state.trim(),
        address: address ? address.trim() : null,
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null
      }
    });

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to create customer record" });
  }
});

export default router;
