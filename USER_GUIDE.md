# GST SAHAYAK — User & Operational Guide

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Tagline:** "Smarter Invoices. Safer Business."  

---

## 1. Introduction

Welcome to **GST Sahayak**! GST Sahayak is an intelligent pre-validation and risk analysis platform designed for Indian businesses, Chartered Accountants, and tax consultants. 

Unlike traditional billing software that allows non-compliant invoices to be finalized, GST Sahayak pre-validates transactions before you generate final tax documents. It combines:
1. **Deterministic Rule Engine:** Verifies that your invoice adheres strictly to statutory GST rules and math.
2. **Machine Learning Anomaly Radar:** Detects unusual volume, price, and discount patterns.
3. **Explainable AI (XAI):** Explains exactly why an alert was raised and suggests clear corrective actions.

---

## 2. End-to-End Operational Workflow

```
   1. Login & Business Profile
             │
             ▼
   2. Product Master & HSN Search
             │
             ▼
   3. Create Invoice (Customer & Products)
             │
             ▼
   4. Real-Time Decimal Tax Split (CGST/SGST vs IGST)
             │
             ▼
   5. Hybrid Pre-Validation Audit
      ├── Deterministic Rules Check (Zero Math Drift)
      └── Isolation Forest Outlier Scan (Volume & Price Radar)
             │
             ▼
   6. Review Explainable AI (XAI) Attributions
             │
             ├── If Errors: Edit Invoice & Revalidate
             │
             ▼
   7. Finalize Invoice & Download Statutory Tax Invoice (PDF)
             │
             ▼
   8. Historical Records, Telemetry & Audit Logs
```

---

## 3. Step-by-Step Walkthrough

### Step 1: Authentication & Access
- Navigate to the application portal.
- **New Account:** Click **Register** to create a business user profile. Your password must be at least 8 characters long, start with an uppercase letter, and contain numbers and symbols (e.g. `Business@2026`).
- **Demo Mode:** Click **One-Click Instant Demo Login** to explore using pre-seeded demonstration data.

### Step 2: Configure Business Profile
- Select **Business Profile** from the sidebar.
- Enter your **Legal Business Name**, **15-character GSTIN**, and **Registered State**.
- *Why this matters:* The system uses your registered state (Place of Origin) to automatically determine whether supplies are **Intra-State** (50% CGST + 50% SGST) or **Inter-State** (100% IGST).

### Step 3: Manage Products & Use AI HSN Assistant
- Open **Product Catalog**.
- Click **Add Product**.
- Type a product description (e.g., *"ASUS TUF A16 laptop"* or *"IT technical consulting"*).
- The **AI HSN Assistant** searches the official CBIC classification master and returns candidate codes with standard GST rate slabs (0%, 5%, 12%, 18%, 28%).
- Click **Verify & Apply** to assign the code to your catalog product.

### Step 4: Create a Pre-Validated Invoice
- Click **Create Invoice** to open the 4-step wizard:
  - **Step 1 — Invoice Meta:** Auto-generated unique serial number and invoice date.
  - **Step 2 — Recipient Customer:** Select an existing customer or enter a new customer name, GSTIN, and destination state. The system instantly detects if the transaction is Inter-State or Intra-State.
  - **Step 3 — Line Items:** Select products from your catalog, enter quantity, unit price, and applicable line-item discount. Taxes and totals re-calculate in real time.
  - **Step 4 — Review & Pre-Validate:** Click **Run Pre-Validation**.

### Step 5: Interpret Validation & Explainable AI Audit
When the pre-validation modal appears:
- **Green (VALID):** All statutory GST rules passed and transaction matches normal business baselines.
- **Amber (WARNING):** Minor anomaly detected (e.g., high discount or e-Way Bill threshold exceeded). Review the suggested actions.
- **Red (POTENTIAL_RISK / FAIL):** A statutory rule failed (e.g., math mismatch or invalid GSTIN). Finalization is blocked until the error is corrected.
- **XAI Feature Weights:** View the percentage contribution chart showing exactly which factors triggered the score.

### Step 6: Finalize & Print Statutory PDF
- Once all blocking errors are resolved, click **Finalize Invoice**.
- Click **Print / Save as PDF** in the print preview modal.
- The statutory tax invoice conforms to **Section 31 of the CGST Act, 2017**, including supplier details, recipient billing information, HSN breakdown, statutory tax summary, and authorized signatory stamp.

### Step 7: Inspect Dashboard Telemetry & Audit Logs
- Check the **Dashboard** for monthly turnover trends, tax collections, and risk distributions.
- Check **Compliance & Risk** for category-wise anomaly telemetry.
- Open **Rule Governance** to inspect active rules and review immutable timestamped **Audit Logs**.

