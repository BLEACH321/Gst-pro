import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/business
router.get("/", authMiddleware, async (req, res) => {
  try {
    const business = await prisma.business.findFirst({
      where: { userId: req.user.id }
    });

    if (!business) {
      return res.status(404).json({ error: "Business profile not found" });
    }

    res.json(business);
  } catch (err) {
    res.status(500).json({ error: "Failed to load business profile" });
  }
});

// PUT /api/business
router.put("/", authMiddleware, async (req, res) => {
  try {
    const {
      businessName,
      gstin,
      businessCategory,
      registrationType,
      state,
      address,
      email,
      phone
    } = req.body;

    const updated = await prisma.business.upsert({
      where: { userId: req.user.id },
      update: {
        businessName,
        gstin,
        businessCategory,
        registrationType: registrationType || "Regular",
        state,
        address,
        email,
        phone
      },
      create: {
        userId: req.user.id,
        businessName,
        gstin,
        businessCategory,
        registrationType: registrationType || "Regular",
        state,
        address,
        email,
        phone
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "BUSINESS_PROFILE_UPDATED",
        entityType: "Business",
        entityId: updated.id,
        details: `Updated details for ${updated.businessName} (GSTIN: ${updated.gstin})`
      }
    });

    res.json({ message: "Business profile updated successfully", business: updated });
  } catch (err) {
    console.error("Update Business Error:", err);
    res.status(500).json({ error: "Failed to update business profile" });
  }
});

export default router;
