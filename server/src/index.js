import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import productRoutes from "./routes/products.js";
import customerRoutes from "./routes/customers.js";
import invoiceRoutes from "./routes/invoices.js";
import aiRoutes from "./routes/ai.js";
import ruleRoutes from "./routes/rules.js";
import reportRoutes from "./routes/reports.js";
import auditLogRoutes from "./routes/auditLogs.js";
import agentRoutes from "./routes/agent.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "GST Sahayak Backend Engine", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", (req, res, next) => {
  // Direct shortcut route for /api/dashboard
  req.url = "/dashboard";
  aiRoutes(req, res, next);
});
app.use("/api/anomalies", (req, res, next) => {
  // Direct shortcut route for /api/anomalies
  req.url = "/anomalies";
  aiRoutes(req, res, next);
});
app.use("/api/rules", ruleRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/agent", agentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 GST Sahayak Server running on http://localhost:${PORT}`);
});
