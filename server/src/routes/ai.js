import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { analyzeInvoiceWithAI } from "../services/aiService.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ai/analyze
router.post("/analyze", authMiddleware, async (req, res) => {
  try {
    const analysis = await analyzeInvoiceWithAI(req.body);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: "AI analysis failed: " + err.message });
  }
});

// GET /api/ai/anomalies (Anomaly Dashboard data)
router.get("/anomalies", authMiddleware, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: {
        anomalyResult: true,
        items: true
      },
      orderBy: { createdAt: "desc" }
    });

    const totalTransactions = invoices.length;
    const anomalies = invoices.filter(inv => inv.riskLevel === "POTENTIAL_RISK" || inv.anomalyResult?.isAnomaly);
    const warnings = invoices.filter(inv => inv.riskLevel === "WARNING");
    const normal = invoices.filter(inv => inv.riskLevel === "VALID" && !inv.anomalyResult?.isAnomaly);

    const totalAmount = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const avgAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    const highestAnomalyScore = Math.max(...invoices.map(inv => inv.riskScore || 0), 0);

    // Distribution ranges for chart
    const distributionRanges = [
      { range: "₹0 - 25K", count: 0, anomalies: 0 },
      { range: "₹25K - 100K", count: 0, anomalies: 0 },
      { range: "₹100K - 250K", count: 0, anomalies: 0 },
      { range: "₹250K - 500K", count: 0, anomalies: 0 },
      { range: "₹500K+", count: 0, anomalies: 0 }
    ];

    invoices.forEach(inv => {
      const isAnom = inv.riskLevel === "POTENTIAL_RISK";
      if (inv.grandTotal < 25000) {
        distributionRanges[0].count++;
        if (isAnom) distributionRanges[0].anomalies++;
      } else if (inv.grandTotal < 100000) {
        distributionRanges[1].count++;
        if (isAnom) distributionRanges[1].anomalies++;
      } else if (inv.grandTotal < 250000) {
        distributionRanges[2].count++;
        if (isAnom) distributionRanges[2].anomalies++;
      } else if (inv.grandTotal < 500000) {
        distributionRanges[3].count++;
        if (isAnom) distributionRanges[3].anomalies++;
      } else {
        distributionRanges[4].count++;
        if (isAnom) distributionRanges[4].anomalies++;
      }
    });

    // Category breakdown
    const categoryMap = {};
    invoices.forEach(inv => {
      inv.items.forEach(it => {
        const cat = it.productName.includes("Laptop") || it.productName.includes("Computer") ? "IT Hardware"
          : (it.productName.includes("Consulting") || it.productName.includes("Software") ? "IT Services"
          : (it.productName.includes("Chair") || it.productName.includes("Paper") ? "Office Supplies"
          : (it.productName.includes("AC") ? "Appliances" : "General Commercial")));

        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, anomalies: 0, amount: 0 };
        categoryMap[cat].total++;
        categoryMap[cat].amount += it.total;
        if (inv.riskLevel === "POTENTIAL_RISK") categoryMap[cat].anomalies++;
      });
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      totalItems: categoryMap[cat].total,
      anomalies: categoryMap[cat].anomalies,
      totalAmount: categoryMap[cat].amount
    }));

    // Recent anomalies list
    const recentAnomalies = anomalies.slice(0, 10).map(inv => {
      let suggestedActions = [];
      try {
        if (inv.anomalyResult?.suggestedActions) {
          suggestedActions = JSON.parse(inv.anomalyResult.suggestedActions);
        }
      } catch (e) {}

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        date: inv.invoiceDate,
        amount: inv.grandTotal,
        gst: inv.totalGst,
        score: inv.riskScore,
        riskLevel: inv.riskLevel,
        reason: inv.anomalyResult?.explanation || "Unusual transaction profile detected",
        suggestedActions,
        status: inv.status
      };
    });

    res.json({
      metrics: {
        totalTransactions,
        normalCount: normal.length,
        warningCount: warnings.length,
        anomalyCount: anomalies.length,
        averageAmount: Math.round(avgAmount),
        highestAnomalyScore: Math.round(highestAnomalyScore)
      },
      distributionRanges,
      categoryBreakdown,
      recentAnomalies
    });
  } catch (err) {
    console.error("Anomalies route error:", err);
    res.status(500).json({ error: "Failed to load anomaly statistics" });
  }
});

// GET /api/dashboard (Main Business & Invoice Dashboard KPIs + Charts)
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: { items: true, anomalyResult: true },
      orderBy: { createdAt: "desc" }
    });

    const totalInvoices = invoices.length;
    const validated = invoices.filter(i => i.riskLevel === "VALID");
    const warnings = invoices.filter(i => i.riskLevel === "WARNING");
    const riskFound = invoices.filter(i => i.riskLevel === "POTENTIAL_RISK");
    const anomaliesCount = invoices.filter(i => i.anomalyResult?.isAnomaly).length;

    const totalTaxable = invoices.reduce((acc, i) => acc + i.taxableAmount, 0);
    const totalGst = invoices.reduce((acc, i) => acc + i.totalGst, 0);
    const grandTotalSum = invoices.reduce((acc, i) => acc + i.grandTotal, 0);

    // Monthly trends (aggregate last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = {};

    invoices.forEach(inv => {
      const d = new Date(inv.invoiceDate);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, totalInvoices: 0, validCount: 0, riskCount: 0, taxable: 0, gst: 0, revenue: 0 };
      }
      monthlyMap[key].totalInvoices++;
      if (inv.riskLevel === "VALID") monthlyMap[key].validCount++;
      else monthlyMap[key].riskCount++;
      monthlyMap[key].taxable += inv.taxableAmount;
      monthlyMap[key].gst += inv.totalGst;
      monthlyMap[key].revenue += inv.grandTotal;
    });

    let monthlyTrends = Object.values(monthlyMap);
    if (monthlyTrends.length === 0) {
      const now = new Date();
      monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
        monthlyTrends.push({
          month: key,
          totalInvoices: 0,
          validCount: 0,
          riskCount: 0,
          taxable: 0,
          gst: 0,
          revenue: 0
        });
      }
    }

    const recentInvoices = invoices.slice(0, 8).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: inv.invoiceDate,
      customer: inv.customerName,
      customerGstin: inv.customerGstin,
      amount: inv.grandTotal,
      taxable: inv.taxableAmount,
      gst: inv.totalGst,
      validation: inv.status,
      risk: inv.riskLevel,
      riskScore: inv.riskScore,
      isAnomaly: inv.anomalyResult?.isAnomaly || false
    }));

    res.json({
      kpis: {
        totalInvoices,
        validated: validated.length,
        warnings: warnings.length,
        riskFound: riskFound.length,
        anomaliesDetected: anomaliesCount,
        totalTaxableAmount: Math.round(totalTaxable),
        totalGst: Math.round(totalGst),
        grandTotalRevenue: Math.round(grandTotalSum)
      },
      monthlyTrends,
      recentInvoices
    });
  } catch (err) {
    console.error("Dashboard route error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;
