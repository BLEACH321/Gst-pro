# GST SAHAYAK — Deterministic GST Rule Engine Documentation

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Module:** Deterministic Validation Engine (`server/src/rules/gstRuleEngine.js`)  
**Engine Version:** 1.0.0-PRO  

---

## 1. Engine Purpose and Philosophy

The GST Sahayak Rule Engine is a **deterministic statutory validation service**. It is built on the legal requirements of the Central Goods and Services Tax (CGST) Act, 2017, the Integrated Goods and Services Tax (IGST) Act, 2017, and the CGST Rules, 2017.

### Core Principles:
1. **Zero Probabilistic Hallucination:** Rules are purely algorithmic boolean expressions. They never rely on language models or probabilistic inference for tax arithmetic or legal conditions.
2. **Strict Bifurcation of Severity:**
   - **`ERROR` (Blocking):** Violates mandatory statutory requirements (e.g., bad GSTIN, missing fields, arithmetic drift). The invoice **cannot be finalized** until the error is corrected.
   - **`WARNING` (Advisory / Review Recommended):** Flags conditions that require human verification but do not legally invalidate the invoice (e.g., e-Way Bill threshold advisory, luxury 28% tax rate). Finalization is permitted after review.
   - **`INFO` (Informational):** Confirms passed compliance conditions (e.g., verified B2C transaction, intra-state 50-50 tax allocation verified).
3. **Structured Response Contract:** Every rule evaluation returns machine-readable and human-intelligible metadata.

---

## 2. Standardized Rule Result Schema

```json
{
  "ruleId": "RULE-GST-006",
  "ruleName": "Line Item Tax Math Verification",
  "status": "FAIL",
  "severity": "ERROR",
  "message": "Mathematical discrepancy in line items: Item #1 (Laptop): expected taxable ₹84,990.00, got ₹70,000.00.",
  "suggestedAction": "Recalculate line item taxable amounts to match (Quantity × Unit Price) - Discount."
}
```

---

## 3. Catalog of Implemented Validation Rules

### RULE-GST-001: GSTIN Structure & PAN Checksum Validation
- **Statutory Reference:** Section 25 of the CGST Act, 2017 read with Rule 8 of the CGST Rules.
- **Description:** Verifies supplier and customer GST identification numbers against the official 15-character statutory format:
  `^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
- **Logic:**
  1. Characters 1–2: Valid state/UT code (01 to 38, 97, 99).
  2. Characters 3–12: 10-character Permanent Account Number (PAN) of the entity.
  3. Character 13: Entity registration number within the state (1–9 or A–Z).
  4. Character 14: Default statutory letter 'Z'.
  5. Character 15: Checksum verification digit.
- **Severity:** `ERROR` for supplier GSTIN or registered B2B customer GSTIN; `INFO` for unregistered B2C customers.
- **Corrective Action:** "Verify PAN and 2-digit state code prefix in Business Profile / Customer Master."

---

### RULE-GST-002: Mandatory Statutory Fields Verification
- **Statutory Reference:** Section 31 of CGST Act read with Rule 46 (Tax Invoice Contents).
- **Description:** Ensures an invoice cannot be issued without the legally required minimum particulars.
- **Required Fields:**
  - `invoiceNumber`: Unique serial number.
  - `invoiceDate`: Date of issuance.
  - `customerName`: Recipient identity.
  - `customerState`: Place of supply state designation.
  - `items`: Minimum of 1 valid line item.
- **Severity:** `ERROR`
- **Corrective Action:** "Fill in all mandatory invoice metadata fields before finalizing."

---

### RULE-GST-003: HSN / SAC Code Availability & Format
- **Statutory Reference:** CBIC Notification No. 78/2020 – Central Tax (Mandatory HSN on Tax Invoices).
- **Description:** Validates classification codes:
  - Goods HSN codes must be 4, 6, or 8 digits.
  - Services SAC codes must be 6 digits beginning with `99`.
- **Severity:** `ERROR` if HSN is missing; `WARNING` if code format deviates from 4/6/8-digit convention.
- **Corrective Action:** "Assign standard 4-8 digit HSN code using the AI HSN Assistant."

---

### RULE-GST-004: GST Rate Slab Verification
- **Statutory Reference:** GST Council Rate Notifications under Section 9 of CGST Act.
- **Description:** Checks item tax rates against standard statutory rate brackets: `[0%, 0.1%, 0.25%, 3%, 5%, 12%, 18%, 28%]`.
- **Severity:** `WARNING`
- **Corrective Action:** "Verify whether an official council notification or exemption applies to non-standard tax rates."

---

### RULE-GST-005: Place of Supply Tax Allocation (CGST/SGST vs IGST)
- **Statutory Reference:** Sections 7 & 8 of the Integrated GST (IGST) Act, 2017.
- **Description:**
  - **Intra-State Supply (Supplier State == Customer State):**
    - IGST must be exactly ₹0.00.
    - CGST and SGST must each equal exactly 50% of the total tax assessed.
    - `|CGST - SGST| <= 0.05`
  - **Inter-State Supply (Supplier State != Customer State):**
    - 100% of the tax must be allocated to IGST.
    - CGST and SGST must both equal exactly ₹0.00.
- **Severity:** `ERROR`
- **Corrective Action:** "Adjust tax allocation: Inter-state transactions must charge IGST only; intra-state must split 50-50 into CGST and SGST."

---

### RULE-GST-006: Line Item Mathematical Integrity
- **Statutory Reference:** Standard statutory tax base determination under Section 15 of CGST Act.
- **Description:** Re-evaluates item figures to 2 decimal places:
  `Expected Taxable = Max(0, (Quantity × UnitPrice) - Discount)`
  Tolerance: `|Expected Taxable - Actual Taxable| <= 0.50`
- **Severity:** `ERROR`
- **Corrective Action:** "Recalculate line item taxable base to match Quantity × Price - Discount."

---

### RULE-GST-007: Grand Total Aggregate Reconciliation
- **Statutory Reference:** Rule 46(n) of CGST Rules (Total Value of Supply).
- **Description:** Ensures the final invoice payable amount reconciles perfectly:
  `Expected Grand Total = Total Taxable Amount + Total CGST + Total SGST + Total IGST`
  Tolerance: `|Grand Total - Expected Grand Total| <= 0.05`
- **Severity:** `ERROR`
- **Corrective Action:** "Re-aggregate taxable and tax totals before finalization."

---

### RULE-GST-008: Duplicate Invoice Number Sequence Protection
- **Statutory Reference:** Rule 46(b) of CGST Rules (Consecutive serial numbers unique for a financial year).
- **Description:** Checks active and finalized invoice records for the current business tenant to prevent accidental duplicate invoice issuance.
- **Severity:** `ERROR`
- **Corrective Action:** "Use a unique sequential invoice serial number (e.g. INV/2026/0101)."

---

### RULE-GST-009: Non-Negative Value Constraints
- **Statutory Reference:** Financial validation standards and commercial law.
- **Description:** Enforces that:
  - `Quantity > 0`
  - `UnitPrice > 0`
  - `Discount >= 0`
- **Severity:** `ERROR`
- **Corrective Action:** "Ensure all item quantities and prices are positive numbers."

---

### RULE-GST-010: E-Way Bill Applicability Notice
- **Statutory Reference:** Rule 138 of the CGST Rules, 2017 (e-Way Bill Generation).
- **Description:** Automatically checks consignment invoice value:
  If `Grand Total > ₹50,000`, generation of an electronic waybill on the NIC portal is legally mandatory before goods movement commences.
- **Severity:** `WARNING`
- **Corrective Action:** "Generate mandatory e-Way Bill on the NIC e-Way Bill Portal prior to consignment dispatch."

