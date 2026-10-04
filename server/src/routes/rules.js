import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Initial standard rules catalog if empty
export const DEFAULT_RULES = [
  {
    ruleId: "RULE-GST-001",
    ruleName: "GSTIN Checksum & Format Validation",
    description: "Validates 15-character alphanumeric GSTIN against statutory state code (01-38) and PAN checksum specifications.",
    category: "GST_COMPLIANCE",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "REGEX_FORMAT"
  },
  {
    ruleId: "RULE-GST-002",
    ruleName: "Mandatory Statutory Fields",
    description: "Ensures essential invoice metadata (Invoice No, Date, Customer, State, Items) are fully populated.",
    category: "STRUCTURE",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "MANDATORY_PRESENCE"
  },
  {
    ruleId: "RULE-GST-003",
    ruleName: "HSN / SAC Code Classification",
    description: "Verifies that item lines contain compliant 4 to 8 digit HSN or 6-digit SAC codes.",
    category: "GST_COMPLIANCE",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "CODE_LOOKUP"
  },
  {
    ruleId: "RULE-GST-004",
    ruleName: "GST Council Rate Slab Verification",
    description: "Checks item tax rates against standard GST council schedules (0%, 5%, 12%, 18%, 28%).",
    category: "TAX_CALCULATION",
    severity: "WARNING",
    isEnabled: true,
    conditionType: "ENUM_VALIDITY"
  },
  {
    ruleId: "RULE-GST-005",
    ruleName: "Place of Supply Tax Allocation (CGST/SGST vs IGST)",
    description: "Enforces strict bifurcation: equal CGST & SGST for intra-state vs 100% IGST for inter-state supplies.",
    category: "TAX_CALCULATION",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "GEOGRAPHIC_LOGIC"
  },
  {
    ruleId: "RULE-GST-006",
    ruleName: "Line Item Mathematical Integrity",
    description: "Recomputes (Quantity × Unit Price - Discount) and tax rates down to 2 decimal places.",
    category: "TAX_CALCULATION",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "ARITHMETIC_CONSISTENCY"
  },
  {
    ruleId: "RULE-GST-007",
    ruleName: "Grand Total Aggregate Reconciliation",
    description: "Ensures invoice Grand Total exactly equals Taxable Base + Total GST without unauthorized roundoff drift.",
    category: "TAX_CALCULATION",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "ARITHMETIC_CONSISTENCY"
  },
  {
    ruleId: "RULE-GST-008",
    ruleName: "Invoice Sequence & Duplicate Protection",
    description: "Prevents accidental duplicate invoice issuance within the same operational financial year.",
    category: "BUSINESS_LOGIC",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "UNIQUENESS"
  },
  {
    ruleId: "RULE-GST-009",
    ruleName: "Positive Value & Non-Negative Constraints",
    description: "Requires quantities and prices strictly > 0 and discounts >= 0.",
    category: "BUSINESS_LOGIC",
    severity: "ERROR",
    isEnabled: true,
    conditionType: "RANGE_LIMIT"
  },
  {
    ruleId: "RULE-GST-010",
    ruleName: "E-Way Bill Compliance Notice (Rule 138)",
    description: "Flags commercial consignments exceeding ₹50,000 threshold for mandatory e-Way bill generation.",
    category: "GST_COMPLIANCE",
    severity: "WARNING",
    isEnabled: true,
    conditionType: "THRESHOLD"
  }
];

// GET /api/rules
router.get("/", authMiddleware, async (req, res) => {
  try {
    let rules = await prisma.validationRule.findMany({
      orderBy: { ruleId: "asc" }
    });

    if (rules.length === 0) {
      // Seed default rules
      for (const r of DEFAULT_RULES) {
        await prisma.validationRule.create({ data: r });
      }
      rules = await prisma.validationRule.findMany({ orderBy: { ruleId: "asc" } });
    }

    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch validation rules: " + err.message });
  }
});

// POST /api/rules
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { ruleId, ruleName, description, category, severity, isEnabled, conditionType } = req.body;
    
    if (!ruleId || !ruleName) {
      return res.status(400).json({ error: "Rule ID and Rule Name are required." });
    }

    const rule = await prisma.validationRule.create({
      data: {
        ruleId: ruleId.trim().toUpperCase(),
        ruleName,
        description: description || "",
        category: category || "GST_COMPLIANCE",
        severity: severity || "ERROR",
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        conditionType: conditionType || "CUSTOM"
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "RULE_CREATED",
        entityType: "ValidationRule",
        entityId: rule.id,
        details: `Created rule ${rule.ruleId}: ${rule.ruleName}`
      }
    });

    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: "Failed to create rule: " + err.message });
  }
});

// PUT /api/rules/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { ruleName, description, category, severity, isEnabled, conditionType } = req.body;

    const updated = await prisma.validationRule.update({
      where: { id },
      data: {
        ruleName,
        description,
        category,
        severity,
        isEnabled,
        conditionType
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "RULE_UPDATED",
        entityType: "ValidationRule",
        entityId: updated.id,
        details: `Updated rule ${updated.ruleId} (Enabled: ${updated.isEnabled})`
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update validation rule" });
  }
});

export default router;
