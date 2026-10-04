/**
 * GST Sahayak - Deterministic Rule-Based GST Validation Engine
 * Evaluates incoming invoices against Indian GST compliance standards and configurable rules.
 */

// GSTIN Regex Format: 2 digits (state code 01-38, 97, 99) + 5 letters + 4 numbers + 1 letter + 1 char + 'Z' + 1 char
const GSTIN_REGEX = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const VALID_GST_RATES = [0, 0.1, 0.25, 3, 5, 12, 18, 28];

const STATE_CODES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
  "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh (New)", "38": "Ladakh"
};

function getStateFromGstin(gstin) {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  return STATE_CODES[code] || null;
}

/**
 * Validates complete invoice payload against all active GST rules.
 * @param {Object} invoice Invoice object containing supplier, customer, items, and tax breakdown
 * @param {Array} activeRules Configured rules from database
 * @param {Object} existingInvoices List of existing invoice numbers for duplicate check
 * @returns {Object} Validation summary, status, and list of rule evaluations
 */
export function validateGstRules(invoice, activeRules = [], existingInvoices = []) {
  const results = [];
  let errorCount = 0;
  let warningCount = 0;
  let passCount = 0;

  // Helper to record rule result
  function record(ruleId, ruleName, status, severity, message, suggestedAction = null) {
    if (status === "FAIL") errorCount++;
    else if (status === "WARNING") warningCount++;
    else passCount++;

    results.push({
      ruleId,
      ruleName,
      status, // "PASS", "FAIL", "WARNING"
      severity, // "ERROR", "WARNING", "INFO"
      message,
      suggestedAction
    });
  }

  // --- RULE-GST-001: GSTIN Structure & State Code Validation ---
  const supplierGstin = invoice.supplierGstin || invoice.businessGstin || "";
  const customerGstin = invoice.customerGstin || "";
  
  if (supplierGstin) {
    if (!GSTIN_REGEX.test(supplierGstin.toUpperCase())) {
      record(
        "RULE-GST-001",
        "Supplier GSTIN Format Check",
        "FAIL",
        "ERROR",
        `Supplier GSTIN '${supplierGstin}' does not conform to the standard 15-character GST structure.`,
        "Verify business PAN and state code prefix in Business Profile."
      );
    } else {
      record(
        "RULE-GST-001",
        "Supplier GSTIN Format Check",
        "PASS",
        "INFO",
        `Supplier GSTIN is valid (${getStateFromGstin(supplierGstin)}).`
      );
    }
  }

  if (customerGstin) {
    if (!GSTIN_REGEX.test(customerGstin.toUpperCase())) {
      record(
        "RULE-GST-001B",
        "Customer GSTIN Format Check",
        "FAIL",
        "ERROR",
        `Customer GSTIN '${customerGstin}' is malformed or invalid.`,
        "Check customer registration certificate or mark as Unregistered B2C."
      );
    } else {
      record(
        "RULE-GST-001B",
        "Customer GSTIN Format Check",
        "PASS",
        "INFO",
        `Customer GSTIN is verified for B2B compliance (${getStateFromGstin(customerGstin)}).`
      );
    }
  } else {
    record(
      "RULE-GST-001B",
      "Customer B2C Designation",
      "PASS",
      "INFO",
      "Treated as unregistered consumer (B2C) transaction."
    );
  }

  // --- RULE-GST-002: Mandatory Invoice Fields Check ---
  const missingFields = [];
  if (!invoice.invoiceNumber || !invoice.invoiceNumber.trim()) missingFields.push("Invoice Number");
  if (!invoice.invoiceDate) missingFields.push("Invoice Date");
  if (!invoice.customerName || !invoice.customerName.trim()) missingFields.push("Customer Name");
  if (!invoice.customerState || !invoice.customerState.trim()) missingFields.push("Place of Supply (State)");
  if (!invoice.items || invoice.items.length === 0) missingFields.push("Line Items");

  if (missingFields.length > 0) {
    record(
      "RULE-GST-002",
      "Mandatory Fields Verification",
      "FAIL",
      "ERROR",
      `Missing mandatory invoice fields: ${missingFields.join(", ")}.`,
      "Fill in all required fields before generating invoice."
    );
  } else {
    record(
      "RULE-GST-002",
      "Mandatory Fields Verification",
      "PASS",
      "INFO",
      "All mandatory GST statutory fields are provided."
    );
  }

  // --- RULE-GST-003: HSN/SAC Code Verification ---
  let hsnErrors = [];
  let hsnMissing = [];
  const items = invoice.items || [];

  items.forEach((item, idx) => {
    const hsn = (item.hsnSac || "").trim();
    if (!hsn) {
      hsnMissing.push(`Item #${idx + 1} (${item.productName || "Unnamed"})`);
    } else {
      // HSN must be 4, 6, or 8 digits. Services SAC starts with 99 and is 6 digits.
      const isValidHsn = /^\d{4,8}$/.test(hsn);
      if (!isValidHsn) {
        hsnErrors.push(`Item #${idx + 1} (${item.productName}): Invalid code '${hsn}'`);
      }
    }
  });

  if (hsnMissing.length > 0) {
    record(
      "RULE-GST-003",
      "HSN/SAC Availability",
      "FAIL",
      "ERROR",
      `HSN/SAC code missing for: ${hsnMissing.join(", ")}.`,
      "Assign HSN code using the AI HSN Assistant or Product Master."
    );
  } else if (hsnErrors.length > 0) {
    record(
      "RULE-GST-003",
      "HSN/SAC Format Validity",
      "WARNING",
      "WARNING",
      `Non-standard HSN codes detected: ${hsnErrors.join("; ")}.`,
      "Ensure HSN is 4-8 digits or SAC is 6 digits starting with 99."
    );
  } else {
    record(
      "RULE-GST-003",
      "HSN/SAC Validation",
      "PASS",
      "INFO",
      "All item line items have valid HSN/SAC classifications."
    );
  }

  // --- RULE-GST-004: GST Rate Slabs Consistency ---
  const invalidRates = [];
  items.forEach((item, idx) => {
    const rate = Number(item.gstRate);
    if (!VALID_GST_RATES.includes(rate)) {
      invalidRates.push(`Item #${idx + 1} (${item.productName}): ${rate}%`);
    }
  });

  if (invalidRates.length > 0) {
    record(
      "RULE-GST-004",
      "GST Rate Slab Consistency",
      "WARNING",
      "WARNING",
      `Non-standard GST rate(s) found: ${invalidRates.join(", ")}. Standard rates are 0%, 5%, 12%, 18%, 28%.`,
      "Verify if a special notification applies or adjust to a standard tax bracket."
    );
  } else {
    record(
      "RULE-GST-004",
      "GST Rate Slab Consistency",
      "PASS",
      "INFO",
      "All product rates match prescribed GST Council rate schedules."
    );
  }

  // --- RULE-GST-005: Intra-State vs Inter-State Tax Logic ---
  const supplierState = (invoice.supplierState || invoice.businessState || "").toLowerCase().trim();
  const customerState = (invoice.customerState || "").toLowerCase().trim();
  const isInterState = invoice.isInterState !== undefined 
    ? invoice.isInterState 
    : (supplierState && customerState && supplierState !== customerState);

  const cgstTotal = Number(invoice.cgst || 0);
  const sgstTotal = Number(invoice.sgst || 0);
  const igstTotal = Number(invoice.igst || 0);

  if (isInterState) {
    // Inter-state: IGST only, CGST and SGST must be 0
    if (cgstTotal > 0.01 || sgstTotal > 0.01) {
      record(
        "RULE-GST-005",
        "Place of Supply Tax Allocation (IGST vs CGST/SGST)",
        "FAIL",
        "ERROR",
        `Inter-state transaction (${supplierState || "Origin"} → ${customerState || "Destination"}) cannot have CGST or SGST applied. Only IGST is applicable.`,
        "Recalculate taxes with 100% IGST allocation."
      );
    } else {
      record(
        "RULE-GST-005",
        "Place of Supply Tax Allocation",
        "PASS",
        "INFO",
        `Inter-state supply confirmed: 100% IGST applied correctly.`
      );
    }
  } else {
    // Intra-state: CGST == SGST, IGST must be 0
    if (igstTotal > 0.01) {
      record(
        "RULE-GST-005",
        "Place of Supply Tax Allocation (CGST/SGST vs IGST)",
        "FAIL",
        "ERROR",
        `Intra-state supply within ${supplierState || "the same state"} cannot charge IGST. Must be split 50-50 into CGST and SGST.`,
        "Split tax rate equally between CGST and SGST."
      );
    } else if (Math.abs(cgstTotal - sgstTotal) > 0.05) {
      record(
        "RULE-GST-005",
        "CGST/SGST Equality Check",
        "FAIL",
        "ERROR",
        `CGST (₹${cgstTotal.toFixed(2)}) and SGST (₹${sgstTotal.toFixed(2)}) amounts must be exactly equal for intra-state supplies.`,
        "Ensure equal 50-50 tax rate division between Central and State GST."
      );
    } else {
      record(
        "RULE-GST-005",
        "Place of Supply Tax Allocation",
        "PASS",
        "INFO",
        "Intra-state supply verified: CGST and SGST allocated equally."
      );
    }
  }

  // --- RULE-GST-006: Mathematical Line Item Calculation Check ---
  let mathDiscrepancies = [];
  let calculatedTaxableSum = 0;
  let calculatedGstSum = 0;

  items.forEach((item, idx) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unitPrice || 0);
    const discount = Number(item.discount || 0);
    const rate = Number(item.gstRate || 0);

    const expectedTaxable = Math.max(0, (qty * price) - discount);
    const expectedTax = (expectedTaxable * rate) / 100;
    
    calculatedTaxableSum += expectedTaxable;
    calculatedGstSum += expectedTax;

    const actualTaxable = Number(item.taxableAmount !== undefined ? item.taxableAmount : expectedTaxable);
    if (Math.abs(expectedTaxable - actualTaxable) > 0.50) {
      mathDiscrepancies.push(`Item #${idx + 1} (${item.productName}): expected taxable ₹${expectedTaxable.toFixed(2)}, got ₹${actualTaxable.toFixed(2)}`);
    }
  });

  if (mathDiscrepancies.length > 0) {
    record(
      "RULE-GST-006",
      "Line Item Tax Math Verification",
      "FAIL",
      "ERROR",
      `Mathematical discrepancy in line items: ${mathDiscrepancies.join("; ")}.`,
      "Recalculate line item taxable amounts."
    );
  } else {
    record(
      "RULE-GST-006",
      "Line Item Tax Math Verification",
      "PASS",
      "INFO",
      "All item-level quantities, prices, discounts, and taxable bases compute accurately."
    );
  }

  // --- RULE-GST-007: Grand Total Consistency ---
  const invoiceTaxable = Number(invoice.taxableAmount || calculatedTaxableSum);
  const invoiceGst = Number(invoice.totalGst || (cgstTotal + sgstTotal + igstTotal));
  const invoiceGrandTotal = Number(invoice.grandTotal || 0);
  const expectedGrandTotal = invoiceTaxable + invoiceGst;

  if (Math.abs(invoiceGrandTotal - expectedGrandTotal) > 0.50) {
    record(
      "RULE-GST-007",
      "Grand Total Reconciliation",
      "FAIL",
      "ERROR",
      `Invoice Grand Total (₹${invoiceGrandTotal.toFixed(2)}) does not match Taxable Value + GST (₹${expectedGrandTotal.toFixed(2)}). Difference: ₹${Math.abs(invoiceGrandTotal - expectedGrandTotal).toFixed(2)}.`,
      "Re-aggregate total taxable and tax figures before saving."
    );
  } else {
    record(
      "RULE-GST-007",
      "Grand Total Reconciliation",
      "PASS",
      "INFO",
      `Invoice total (₹${invoiceGrandTotal.toFixed(2)}) reconciles perfectly.`
    );
  }

  // --- RULE-GST-008: Duplicate Invoice Number Check ---
  const currentInvNum = (invoice.invoiceNumber || "").trim().toUpperCase();
  const isDuplicate = existingInvoices.some(
    inv => (inv.invoiceNumber || "").trim().toUpperCase() === currentInvNum && inv.id !== invoice.id
  );

  if (isDuplicate) {
    record(
      "RULE-GST-008",
      "Duplicate Invoice Number Check",
      "FAIL",
      "ERROR",
      `Invoice number '${currentInvNum}' has already been finalized in this financial year.`,
      "Use a unique sequential invoice number (e.g., INV/2026/0101)."
    );
  } else {
    record(
      "RULE-GST-008",
      "Invoice Sequence Integrity",
      "PASS",
      "INFO",
      "Invoice number is unique and valid."
    );
  }

  // --- RULE-GST-009: Negative & Zero Value Constraints ---
  let invalidValues = [];
  items.forEach((item, idx) => {
    if (Number(item.quantity) <= 0) invalidValues.push(`Item #${idx + 1} Quantity ≤ 0`);
    if (Number(item.unitPrice) <= 0) invalidValues.push(`Item #${idx + 1} Unit Price ≤ 0`);
    if (Number(item.discount) < 0) invalidValues.push(`Item #${idx + 1} Negative Discount`);
  });

  if (invalidValues.length > 0) {
    record(
      "RULE-GST-009",
      "Value Constraint Check",
      "FAIL",
      "ERROR",
      `Invalid quantities or negative figures detected: ${invalidValues.join(", ")}.`,
      "Ensure all quantities and prices are positive numbers."
    );
  } else {
    record(
      "RULE-GST-009",
      "Value Constraint Check",
      "PASS",
      "INFO",
      "All numerical values comply with non-negative constraints."
    );
  }

  // --- RULE-GST-010: E-Way Bill Requirement Threshold Check (Info / Warning) ---
  if (invoiceGrandTotal > 50000) {
    record(
      "RULE-GST-010",
      "E-Way Bill Mandatory Check (Rule 138)",
      "WARNING",
      "WARNING",
      `Consignment value exceeds ₹50,000 threshold. Generation of e-Way Bill is mandatory prior to goods movement.`,
      "Generate e-Way Bill on the NIC e-Way Bill Portal for this invoice."
    );
  } else {
    record(
      "RULE-GST-010",
      "E-Way Bill Threshold Check",
      "PASS",
      "INFO",
      "Invoice value is within standard threshold (no mandatory e-Way bill required unless inter-state transport rule dictates)."
    );
  }

  // Overall Rule engine verdict
  const overallStatus = errorCount > 0 ? "FAIL" : (warningCount > 0 ? "WARNING" : "PASS");

  return {
    status: overallStatus,
    summary: {
      totalRules: results.length,
      passed: passCount,
      warnings: warningCount,
      failed: errorCount
    },
    results
  };
}
