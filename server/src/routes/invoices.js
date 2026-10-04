import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { validateGstRules } from "../rules/gstRuleEngine.js";
import { analyzeInvoiceWithAI } from "../services/aiService.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/invoices/validate-preview (Pre-validation check without saving)
router.post("/validate-preview", authMiddleware, async (req, res) => {
  try {
    const invoiceData = req.body;
    const business = await prisma.business.findFirst({ where: { userId: req.user.id } });
    const existingInvoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      select: { id: true, invoiceNumber: true }
    });

    const enrichedInvoice = {
      ...invoiceData,
      supplierGstin: business?.gstin || "27ABCDE1234F1Z5",
      supplierState: business?.state || "Maharashtra"
    };

    // 1. Run Deterministic GST Rule Engine
    const ruleEvaluation = validateGstRules(enrichedInvoice, [], existingInvoices);

    // 2. Run AI Anomaly Detection & Explainable AI
    const aiEvaluation = await analyzeInvoiceWithAI(enrichedInvoice);

    // 3. Synthesize Overall Hybrid Risk
    let overallRiskLevel = "VALID";
    if (ruleEvaluation.status === "FAIL" || aiEvaluation.riskLevel === "POTENTIAL_RISK") {
      overallRiskLevel = "POTENTIAL_RISK";
    } else if (ruleEvaluation.status === "WARNING" || aiEvaluation.riskLevel === "WARNING") {
      overallRiskLevel = "WARNING";
    }

    res.json({
      overallStatus: overallRiskLevel,
      ruleEngine: ruleEvaluation,
      aiAnalysis: aiEvaluation,
      summary: {
        totalRulesEvaluated: ruleEvaluation.summary.totalRules,
        passedRules: ruleEvaluation.summary.passed,
        warningRules: ruleEvaluation.summary.warnings,
        failedRules: ruleEvaluation.summary.failed,
        anomalyScore: aiEvaluation.riskScore,
        isAnomaly: aiEvaluation.isAnomaly,
        riskLevel: overallRiskLevel
      }
    });
  } catch (err) {
    console.error("Validation Preview Error:", err);
    res.status(500).json({ error: "Failed to validate invoice preview: " + err.message });
  }
});

// GET /api/invoices
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search, riskLevel, status, customer, dateFrom, dateTo } = req.query;
    const where = { userId: req.user.id };

    if (riskLevel && riskLevel !== "ALL") {
      where.riskLevel = riskLevel;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (customer && customer !== "ALL") {
      where.customerName = { contains: customer };
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerGstin: { contains: search } }
      ];
    }

    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
      if (dateTo) where.invoiceDate.lte = new Date(dateTo);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        validationRules: true,
        anomalyResult: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(invoices);
  } catch (err) {
    console.error("Fetch Invoices Error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// GET /api/invoices/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        business: true,
        validationRules: true,
        anomalyResult: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice details" });
  }
});

// POST /api/invoices
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      customerName,
      customerGstin,
      customerState,
      customerAddress,
      items,
      subtotal,
      discount,
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalGst,
      grandTotal,
      isInterState
    } = req.body;

    const business = await prisma.business.findFirst({ where: { userId: req.user.id } });
    const existingInvoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      select: { id: true, invoiceNumber: true }
    });

    const enrichedInvoice = {
      ...req.body,
      supplierGstin: business?.gstin || "27ABCDE1234F1Z5",
      supplierState: business?.state || "Maharashtra"
    };

    // 1. Run Rule Engine
    const ruleEvaluation = validateGstRules(enrichedInvoice, [], existingInvoices);

    // 2. Run AI Engine
    const aiEvaluation = await analyzeInvoiceWithAI(enrichedInvoice);

    // 3. Compute hybrid risk
    let overallRiskLevel = "VALID";
    if (ruleEvaluation.status === "FAIL" || aiEvaluation.riskLevel === "POTENTIAL_RISK") {
      overallRiskLevel = "POTENTIAL_RISK";
    } else if (ruleEvaluation.status === "WARNING" || aiEvaluation.riskLevel === "WARNING") {
      overallRiskLevel = "WARNING";
    }

    // 4. Save to Database
    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        businessId: business?.id || null,
        invoiceNumber: invoiceNumber.trim().toUpperCase(),
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        customerName: customerName.trim(),
        customerGstin: customerGstin ? customerGstin.trim().toUpperCase() : null,
        customerState: customerState.trim(),
        customerAddress: customerAddress || "",
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        taxableAmount: Number(taxableAmount) || 0,
        cgst: Number(cgst) || 0,
        sgst: Number(sgst) || 0,
        igst: Number(igst) || 0,
        totalGst: Number(totalGst) || 0,
        grandTotal: Number(grandTotal) || 0,
        status: overallRiskLevel === "VALID" ? "VALIDATED" : "DRAFT",
        riskLevel: overallRiskLevel,
        riskScore: Number(aiEvaluation.riskScore) || 0,
        isInterState: Boolean(isInterState),
        items: {
          create: (items || []).map((it) => ({
            productId: it.productId || null,
            productName: it.productName,
            hsnSac: it.hsnSac,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            discount: Number(it.discount || 0),
            taxableAmount: Number(it.taxableAmount),
            gstRate: Number(it.gstRate),
            cgst: Number(it.cgst || 0),
            sgst: Number(it.sgst || 0),
            igst: Number(it.igst || 0),
            total: Number(it.total)
          }))
        },
        validationRules: {
          create: ruleEvaluation.results.map((r) => ({
            ruleId: r.ruleId,
            ruleName: r.ruleName,
            status: r.status,
            severity: r.severity,
            message: r.message,
            suggestedAction: r.suggestedAction
          }))
        },
        anomalyResult: {
          create: {
            anomalyScore: aiEvaluation.anomalyScore,
            isAnomaly: aiEvaluation.isAnomaly,
            riskLevel: aiEvaluation.riskLevel,
            explanation: aiEvaluation.explanation,
            featureContributions: JSON.stringify(aiEvaluation.featureContributions || {}),
            suggestedActions: JSON.stringify(aiEvaluation.suggestedActions || [])
          }
        }
      },
      include: {
        items: true,
        validationRules: true,
        anomalyResult: true
      }
    });

    // Also auto-save new customer to customer directory if not existing
    if (customerName) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { userId: req.user.id, name: customerName.trim() }
      });
      if (!existingCustomer) {
        await prisma.customer.create({
          data: {
            userId: req.user.id,
            name: customerName.trim(),
            gstin: customerGstin ? customerGstin.trim().toUpperCase() : null,
            state: customerState.trim(),
            address: customerAddress || ""
          }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "INVOICE_CREATED",
        entityType: "Invoice",
        entityId: invoice.id,
        details: `Created invoice ${invoice.invoiceNumber} (Total: ₹${invoice.grandTotal}, Status: ${invoice.riskLevel})`
      }
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({ error: "Failed to create invoice: " + err.message });
  }
});

// POST /api/invoices/:id/finalize
router.post("/:id/finalize", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: "FINALIZED" }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "INVOICE_FINALIZED",
        entityType: "Invoice",
        entityId: invoice.id,
        details: `Finalized invoice ${invoice.invoiceNumber}`
      }
    });

    res.json({ message: "Invoice finalized successfully", invoice });
  } catch (err) {
    res.status(500).json({ error: "Failed to finalize invoice" });
  }
});

// DELETE /api/invoices/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "INVOICE_DELETED",
        entityType: "Invoice",
        entityId: id,
        details: `Deleted invoice ID: ${id}`
      }
    });

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

export default router;
