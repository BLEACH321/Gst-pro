import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const where = { userId: req.user.id };

    if (fromDate || toDate) {
      where.invoiceDate = {};
      if (fromDate) where.invoiceDate.gte = new Date(fromDate);
      if (toDate) where.invoiceDate.lte = new Date(toDate);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        validationRules: true,
        anomalyResult: true
      },
      orderBy: { invoiceDate: "desc" }
    });

    const totalInvoices = invoices.length;
    const totalTaxable = invoices.reduce((sum, i) => sum + i.taxableAmount, 0);
    const totalCgst = invoices.reduce((sum, i) => sum + i.cgst, 0);
    const totalSgst = invoices.reduce((sum, i) => sum + i.sgst, 0);
    const totalIgst = invoices.reduce((sum, i) => sum + i.igst, 0);
    const totalGst = totalCgst + totalSgst + totalIgst;
    const grandTotal = invoices.reduce((sum, i) => sum + i.grandTotal, 0);

    const validCount = invoices.filter(i => i.riskLevel === "VALID").length;
    const warningCount = invoices.filter(i => i.riskLevel === "WARNING").length;
    const riskCount = invoices.filter(i => i.riskLevel === "POTENTIAL_RISK").length;
    const anomalyCount = invoices.filter(i => i.anomalyResult?.isAnomaly).length;

    // GST Slabs breakdown
    const slabMap = { "0%": 0, "5%": 0, "12%": 0, "18%": 0, "28%": 0 };
    invoices.forEach(inv => {
      inv.items.forEach(it => {
        const rateKey = `${Math.round(it.gstRate)}%`;
        if (slabMap[rateKey] !== undefined) {
          slabMap[rateKey] += it.taxableAmount;
        } else {
          slabMap["18%"] += it.taxableAmount;
        }
      });
    });

    // Validation Issues aggregate
    const issueMap = {};
    invoices.forEach(inv => {
      inv.validationRules.forEach(rule => {
        if (rule.status !== "PASS") {
          if (!issueMap[rule.ruleId]) {
            issueMap[rule.ruleId] = {
              ruleId: rule.ruleId,
              ruleName: rule.ruleName,
              count: 0,
              severity: rule.severity,
              exampleMessage: rule.message
            };
          }
          issueMap[rule.ruleId].count++;
        }
      });
    });

    res.json({
      dateRange: { fromDate, toDate },
      totals: {
        totalInvoices,
        totalTaxable: Math.round(totalTaxable * 100) / 100,
        totalCgst: Math.round(totalCgst * 100) / 100,
        totalSgst: Math.round(totalSgst * 100) / 100,
        totalIgst: Math.round(totalIgst * 100) / 100,
        totalGst: Math.round(totalGst * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        validCount,
        warningCount,
        riskCount,
        anomalyCount
      },
      slabDistribution: Object.keys(slabMap).map(slab => ({
        slab,
        taxableValue: Math.round(slabMap[slab])
      })),
      validationIssues: Object.values(issueMap),
      invoices
    });
  } catch (err) {
    console.error("Reports Summary Error:", err);
    res.status(500).json({ error: "Failed to generate report summary" });
  }
});

export default router;
