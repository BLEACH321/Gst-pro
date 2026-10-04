import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/customers
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

// POST /api/customers
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, gstin, state, address, email, phone } = req.body;
    if (!name || !state) {
      return res.status(400).json({ error: "Customer name and state are required." });
    }

    const customer = await prisma.customer.create({
      data: {
        userId: req.user.id,
        name,
        gstin: gstin ? gstin.toUpperCase().trim() : null,
        state,
        address,
        email,
        phone
      }
    });

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to create customer record" });
  }
});

export default router;
