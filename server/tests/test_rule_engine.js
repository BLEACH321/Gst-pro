import { validateGstRules } from "../src/rules/gstRuleEngine.js";

console.log("==================================================");
console.log("RUNNING GST RULE ENGINE TEST SUITE (RULE-GST-001 - 010)");
console.log("==================================================");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(description, condition, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${description} - ${details}`);
  }
}

// Base compliant invoice fixture
function getBaseInvoice() {
  return {
    id: "inv-test-001",
    invoiceNumber: "INV/2026/0001",
    invoiceDate: "2026-10-29",
    businessGstin: "27AABCG1234F1Z5",
    supplierState: "Maharashtra",
    customerName: "Acme Infotech",
    customerGstin: "27AABCA5566G1Z9",
    customerState: "Maharashtra",
    customerAddress: "Mumbai, Maharashtra",
    isInterState: false,
    items: [
      {
        productName: "ASUS TUF A16 Laptop",
        hsnSac: "84713010",
        quantity: 1,
        unitPrice: 84990,
        discount: 0,
        taxableAmount: 84990,
        gstRate: 18,
        cgst: 7649.1,
        sgst: 7649.1,
        igst: 0,
        total: 100288.2
      }
    ],
    taxableAmount: 84990,
    cgst: 7649.1,
    sgst: 7649.1,
    igst: 0,
    totalGst: 15298.2,
    grandTotal: 100288.2
  };
}

// ----------------------------------------------------
// TEST 1: Baseline Valid Invoice
// ----------------------------------------------------
console.log("\n[Group 1: Baseline Nominal Invoice]");
{
  const inv = getBaseInvoice();
  const res = validateGstRules(inv, [], []);
  assert("Nominal invoice overall status is not FAIL", res.status !== "FAIL", `Status was ${res.status}`);
  const errs = res.results.filter(r => r.status === "FAIL");
  assert("Nominal invoice has 0 failing rules", errs.length === 0, `Errors: ${JSON.stringify(errs)}`);
}

// ----------------------------------------------------
// TEST 2: RULE-GST-001 GSTIN Validation
// ----------------------------------------------------
console.log("\n[Group 2: RULE-GST-001 - GSTIN Format Validation]");
{
  // Valid supplier & customer GSTIN
  const inv = getBaseInvoice();
  const res = validateGstRules(inv, [], []);
  const gstinRule = res.results.find(r => r.ruleId === "RULE-GST-001");
  assert("Valid supplier GSTIN passes", gstinRule?.status === "PASS");

  // Invalid supplier GSTIN (too short / invalid format)
  const invBadSupplier = { ...getBaseInvoice(), businessGstin: "INVALID_GSTIN_123" };
  const resBadSupplier = validateGstRules(invBadSupplier, [], []);
  const badGstinRule = resBadSupplier.results.find(r => r.ruleId === "RULE-GST-001");
  assert("Malformed supplier GSTIN fails", badGstinRule?.status === "FAIL");

  // Unregistered B2C customer
  const invB2C = { ...getBaseInvoice(), customerGstin: null };
  const resB2C = validateGstRules(invB2C, [], []);
  const b2cRule = resB2C.results.find(r => r.ruleId === "RULE-GST-001B");
  assert("Unregistered B2C customer accepted as PASS (INFO)", b2cRule?.status === "PASS");

  // Malformed customer GSTIN
  const invBadCustomer = { ...getBaseInvoice(), customerGstin: "99ZZZZ1234" };
  const resBadCust = validateGstRules(invBadCustomer, [], []);
  const badCustRule = resBadCust.results.find(r => r.ruleId === "RULE-GST-001B");
  assert("Malformed customer GSTIN fails", badCustRule?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 3: RULE-GST-002 Mandatory Fields
// ----------------------------------------------------
console.log("\n[Group 3: RULE-GST-002 - Mandatory Invoice Fields]");
{
  const invMissing = { ...getBaseInvoice(), invoiceNumber: "", customerName: "   " };
  const res = validateGstRules(invMissing, [], []);
  const r2 = res.results.find(r => r.ruleId === "RULE-GST-002");
  assert("Missing invoice number and customer name fails RULE-GST-002", r2?.status === "FAIL");

  const invEmptyItems = { ...getBaseInvoice(), items: [] };
  const resEmptyItems = validateGstRules(invEmptyItems, [], []);
  const r2Items = resEmptyItems.results.find(r => r.ruleId === "RULE-GST-002");
  assert("Empty line items fails RULE-GST-002", r2Items?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 4: RULE-GST-003 HSN/SAC Format & Presence
// ----------------------------------------------------
console.log("\n[Group 4: RULE-GST-003 - HSN/SAC Classification]");
{
  // Missing HSN
  const invMissingHsn = getBaseInvoice();
  invMissingHsn.items[0].hsnSac = "";
  const resMissing = validateGstRules(invMissingHsn, [], []);
  const r3Missing = resMissing.results.find(r => r.ruleId === "RULE-GST-003");
  assert("Missing HSN code fails RULE-GST-003", r3Missing?.status === "FAIL");

  // Invalid HSN format (alphabetic / non-numeric)
  const invBadHsn = getBaseInvoice();
  invBadHsn.items[0].hsnSac = "ABCD";
  const resBad = validateGstRules(invBadHsn, [], []);
  const r3Bad = resBad.results.find(r => r.ruleId === "RULE-GST-003");
  assert("Non-digit HSN code triggers warning/fail on RULE-GST-003", r3Bad?.status === "WARNING" || r3Bad?.status === "FAIL");

  // Valid SAC service code (6 digits starting with 99)
  const invSac = getBaseInvoice();
  invSac.items[0].hsnSac = "998313";
  const resSac = validateGstRules(invSac, [], []);
  const r3Sac = resSac.results.find(r => r.ruleId === "RULE-GST-003");
  assert("Valid 6-digit SAC code passes RULE-GST-003", r3Sac?.status === "PASS");
}

// ----------------------------------------------------
// TEST 5: RULE-GST-004 GST Rate Slabs
// ----------------------------------------------------
console.log("\n[Group 5: RULE-GST-004 - Standard GST Rate Slabs]");
{
  // Standard rates: 0, 5, 12, 18, 28
  const invStandard = getBaseInvoice();
  invStandard.items[0].gstRate = 18;
  const resStd = validateGstRules(invStandard, [], []);
  const r4Std = resStd.results.find(r => r.ruleId === "RULE-GST-004");
  assert("Standard 18% GST rate passes RULE-GST-004", r4Std?.status === "PASS");

  // Non-standard rate: 7.5%
  const invNonStd = getBaseInvoice();
  invNonStd.items[0].gstRate = 7.5;
  const resNonStd = validateGstRules(invNonStd, [], []);
  const r4NonStd = resNonStd.results.find(r => r.ruleId === "RULE-GST-004");
  assert("Non-standard 7.5% rate triggers WARNING on RULE-GST-004", r4NonStd?.status === "WARNING");
}

// ----------------------------------------------------
// TEST 6: RULE-GST-005 Place of Supply & Tax-Head Allocation
// ----------------------------------------------------
console.log("\n[Group 6: RULE-GST-005 - Place of Supply Allocation (CGST/SGST vs IGST)]");
{
  // Intra-state (Maharashtra -> Maharashtra) but IGST incorrectly applied
  const invIntraBad = { ...getBaseInvoice(), isInterState: false, cgst: 0, sgst: 0, igst: 15298.2 };
  const resIntraBad = validateGstRules(invIntraBad, [], []);
  const r5IntraBad = resIntraBad.results.find(r => r.ruleId === "RULE-GST-005");
  assert("Intra-state supply with IGST fails RULE-GST-005", r5IntraBad?.status === "FAIL");

  // Intra-state with CGST != SGST
  const invIntraUnequal = { ...getBaseInvoice(), isInterState: false, cgst: 8000, sgst: 7298.2, igst: 0 };
  const resIntraUnequal = validateGstRules(invIntraUnequal, [], []);
  const r5Unequal = resIntraUnequal.results.find(r => r.ruleId === "RULE-GST-005");
  assert("Intra-state supply with unequal CGST and SGST fails RULE-GST-005", r5Unequal?.status === "FAIL");

  // Inter-state (Maharashtra -> Karnataka) correctly with 100% IGST
  const invInterGood = {
    ...getBaseInvoice(),
    supplierState: "Maharashtra",
    customerState: "Karnataka",
    isInterState: true,
    cgst: 0,
    sgst: 0,
    igst: 15298.2
  };
  const resInterGood = validateGstRules(invInterGood, [], []);
  const r5InterGood = resInterGood.results.find(r => r.ruleId === "RULE-GST-005");
  assert("Inter-state supply with 100% IGST passes RULE-GST-005", r5InterGood?.status === "PASS");

  // Inter-state with CGST/SGST incorrectly charged
  const invInterBad = {
    ...getBaseInvoice(),
    supplierState: "Maharashtra",
    customerState: "Karnataka",
    isInterState: true,
    cgst: 7649.1,
    sgst: 7649.1,
    igst: 0
  };
  const resInterBad = validateGstRules(invInterBad, [], []);
  const r5InterBad = resInterBad.results.find(r => r.ruleId === "RULE-GST-005");
  assert("Inter-state supply charging CGST/SGST fails RULE-GST-005", r5InterBad?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 7: RULE-GST-006 Line Item Math Verification
// ----------------------------------------------------
console.log("\n[Group 7: RULE-GST-006 - Line Item Mathematical Integrity]");
{
  // Correct math: Qty 2 * 10,000 - 1,000 discount = 19,000 taxable
  const invMathGood = getBaseInvoice();
  invMathGood.items = [
    {
      productName: "Item A",
      hsnSac: "84713010",
      quantity: 2,
      unitPrice: 10000,
      discount: 1000,
      taxableAmount: 19000,
      gstRate: 18,
      cgst: 1710,
      sgst: 1710,
      igst: 0,
      total: 22420
    }
  ];
  invMathGood.taxableAmount = 19000;
  invMathGood.cgst = 1710;
  invMathGood.sgst = 1710;
  invMathGood.igst = 0;
  invMathGood.totalGst = 3420;
  invMathGood.grandTotal = 22420;

  const resGood = validateGstRules(invMathGood, [], []);
  const r6Good = resGood.results.find(r => r.ruleId === "RULE-GST-006");
  assert("Correct line item math passes RULE-GST-006", r6Good?.status === "PASS");

  // Corrupted taxableAmount (expected 19000, entered 15000)
  const invMathBad = getBaseInvoice();
  invMathBad.items = [
    {
      productName: "Item A",
      hsnSac: "84713010",
      quantity: 2,
      unitPrice: 10000,
      discount: 1000,
      taxableAmount: 15000, // Discrepancy!
      gstRate: 18,
      cgst: 1710,
      sgst: 1710,
      igst: 0,
      total: 18420
    }
  ];
  const resBad = validateGstRules(invMathBad, [], []);
  const r6Bad = resBad.results.find(r => r.ruleId === "RULE-GST-006");
  assert("Corrupted line taxable base fails RULE-GST-006", r6Bad?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 8: RULE-GST-007 Grand Total Reconciliation
// ----------------------------------------------------
console.log("\n[Group 8: RULE-GST-007 - Grand Total Reconciliation]");
{
  const invTotalGood = getBaseInvoice();
  const resGood = validateGstRules(invTotalGood, [], []);
  const r7Good = resGood.results.find(r => r.ruleId === "RULE-GST-007");
  assert("Grand Total = Taxable + GST passes RULE-GST-007", r7Good?.status === "PASS");

  // Grand total manipulated by +₹500
  const invTotalBad = { ...getBaseInvoice(), grandTotal: 100788.2 };
  const resBad = validateGstRules(invTotalBad, [], []);
  const r7Bad = resBad.results.find(r => r.ruleId === "RULE-GST-007");
  assert("Mismatched Grand Total fails RULE-GST-007", r7Bad?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 9: RULE-GST-008 Duplicate Invoice Detection
// ----------------------------------------------------
console.log("\n[Group 9: RULE-GST-008 - Duplicate Invoice Detection]");
{
  const existingInvoices = [
    { id: "inv-existing-99", invoiceNumber: "INV/2026/0001" },
    { id: "inv-existing-100", invoiceNumber: "INV/2026/0002" }
  ];

  // Unique invoice number
  const invUnique = { ...getBaseInvoice(), id: "inv-new-001", invoiceNumber: "INV/2026/0003" };
  const resUnique = validateGstRules(invUnique, [], existingInvoices);
  const r8Unique = resUnique.results.find(r => r.ruleId === "RULE-GST-008");
  assert("Unique invoice number passes RULE-GST-008", r8Unique?.status === "PASS");

  // Duplicate invoice number
  const invDup = { ...getBaseInvoice(), id: "inv-new-002", invoiceNumber: "INV/2026/0001" };
  const resDup = validateGstRules(invDup, [], existingInvoices);
  const r8Dup = resDup.results.find(r => r.ruleId === "RULE-GST-008");
  assert("Duplicate invoice number fails RULE-GST-008", r8Dup?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 10: RULE-GST-009 Non-Negative Numerical Constraints
// ----------------------------------------------------
console.log("\n[Group 10: RULE-GST-009 - Non-Negative Value Constraints]");
{
  const invNegativeQty = getBaseInvoice();
  invNegativeQty.items[0].quantity = -3;
  const resNegativeQty = validateGstRules(invNegativeQty, [], []);
  const r9Qty = resNegativeQty.results.find(r => r.ruleId === "RULE-GST-009");
  assert("Negative quantity fails RULE-GST-009", r9Qty?.status === "FAIL");

  const invNegativePrice = getBaseInvoice();
  invNegativePrice.items[0].unitPrice = -100;
  const resNegativePrice = validateGstRules(invNegativePrice, [], []);
  const r9Price = resNegativePrice.results.find(r => r.ruleId === "RULE-GST-009");
  assert("Negative unit price fails RULE-GST-009", r9Price?.status === "FAIL");

  const invNegativeDisc = getBaseInvoice();
  invNegativeDisc.items[0].discount = -50;
  const resNegativeDisc = validateGstRules(invNegativeDisc, [], []);
  const r9Disc = resNegativeDisc.results.find(r => r.ruleId === "RULE-GST-009");
  assert("Negative discount fails RULE-GST-009", r9Disc?.status === "FAIL");
}

// ----------------------------------------------------
// TEST 11: RULE-GST-010 E-Way Bill Threshold (> ₹50,000)
// ----------------------------------------------------
console.log("\n[Group 11: RULE-GST-010 - E-Way Bill Threshold Notice (Rule 138)]");
{
  // Grand total > 50,000 (getBaseInvoice has grandTotal 100,288.2)
  const invAbove50k = getBaseInvoice();
  const resAbove = validateGstRules(invAbove50k, [], []);
  const r10Above = resAbove.results.find(r => r.ruleId === "RULE-GST-010");
  assert("Invoice > ₹50,000 triggers E-Way Bill WARNING", r10Above?.status === "WARNING");

  // Grand total < 50,000
  const invBelow50k = {
    ...getBaseInvoice(),
    grandTotal: 35000,
    taxableAmount: 30000,
    cgst: 2500,
    sgst: 2500,
    igst: 0,
    totalGst: 5000,
    items: [
      {
        productName: "Office Chair",
        hsnSac: "94031000",
        quantity: 1,
        unitPrice: 30000,
        discount: 0,
        taxableAmount: 30000,
        gstRate: 18,
        cgst: 2500,
        sgst: 2500,
        igst: 0,
        total: 35000
      }
    ]
  };
  const resBelow = validateGstRules(invBelow50k, [], []);
  const r10Below = resBelow.results.find(r => r.ruleId === "RULE-GST-010");
  assert("Invoice <= ₹50,000 passes E-Way Bill check with INFO", r10Below?.status === "PASS");
}

console.log("\n==================================================");
console.log(`RULE ENGINE RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log("==================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

