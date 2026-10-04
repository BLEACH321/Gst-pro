import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { suggestHsnSac } from "../services/hsnService.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products/suggest-hsn?q=ASUS+TUF
router.get("/suggest-hsn", authMiddleware, (req, res) => {
  const query = req.query.q || "";
  const suggestions = suggestHsnSac(query);
  res.json({
    query,
    count: suggestions.length,
    suggestions
  });
});

// GET /api/products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = { userId: req.user.id };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { hsnSac: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/products
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, category, hsnSac, gstRate, price, unit, description } = req.body;

    if (!name || !hsnSac || price === undefined) {
      return res.status(400).json({ error: "Product name, HSN/SAC, and price are required." });
    }

    const product = await prisma.product.create({
      data: {
        userId: req.user.id,
        name,
        category: category || "General",
        hsnSac: hsnSac.trim(),
        gstRate: Number(gstRate) || 18,
        price: Number(price),
        unit: unit || "PCS",
        description: description || ""
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "PRODUCT_CREATED",
        entityType: "Product",
        entityId: product.id,
        details: `Created product: ${product.name} (HSN: ${product.hsnSac})`
      }
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, hsnSac, gstRate, price, unit, description } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        hsnSac: hsnSac.trim(),
        gstRate: Number(gstRate),
        price: Number(price),
        unit,
        description
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "PRODUCT_UPDATED",
        entityType: "Product",
        entityId: product.id,
        details: `Updated product: ${product.name}`
      }
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "PRODUCT_DELETED",
        entityType: "Product",
        entityId: id,
        details: `Deleted product ID: ${id}`
      }
    });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
