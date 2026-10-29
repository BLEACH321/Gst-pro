# GST SAHAYAK — Phased Implementation Plan

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Version:** 1.0.0-PRO  
**Date:** October 2026  

---

## 1. Overview & Strategy

This implementation plan provides a structured, test-driven path to eliminate every bug, vulnerability, and architectural disconnect identified in the project audit.

The engineering work is divided into 10 sequential phases:
```
Phase 1: Deep Audit & Architecture Baseline (Done)
   │
Phase 2: Critical Fixes (Auth, Tenant Security & Database Integrity)
   │
Phase 3: Deterministic Rule Engine Enhancements & Independent Unit Testing
   │
Phase 4: Authoritative HSN/SAC Master (22,600+ CBIC Codes) & Rate Master
   │
Phase 5: Python Isolation Forest Pipeline & Warning Elimination
   │
Phase 6: Explainable AI (XAI) Alignment & Real Attribution Bridge
   │
Phase 7: Complete Invoice Lifecycle (Edit, Re-Validation & Programmatic PDF)
   │
Phase 8: Workspace Agent Real Tool Binding & Error Elimination
   │
Phase 9: Comprehensive Automated Test Suite (40 Test Cases)
   │
Phase 10: Deployment Preparation, Live Environment Config & Final Verification
```

---

## 2. Phase-by-Phase Implementation Specifications

### Phase 2: Critical Fixes — Authentication & Access Control
- **Target Files:**
  - `server/src/middleware/auth.js`
  - `server/src/routes/auth.js`
  - `server/src/routes/products.js`
  - `server/src/routes/customers.js`
  - `server/src/routes/invoices.js`
  - `server/src/routes/auditLogs.js`
- **Actions:**
  1. **Remove Auth Middleware Auto-Login Fallback:**
     Reject unauthenticated requests with `401 Unauthorized`. Require a valid Bearer token for all protected routes.
  2. **Remove Backdoor Passwords:**
     Eliminate `password !== "demo1234"` and `admin123` hardcoded bypasses in `server/src/routes/auth.js`.
  3. **Enforce Tenant Isolation in Queries:**
     - In `products.js`: update and delete must verify `where: { id, userId: req.user.id }`.
     - In `customers.js`: implement missing `PUT /api/customers/:id` and `DELETE /api/customers/:id` with strict user ownership.
     - In `auditLogs.js`: filter logs by `where: { userId: req.user.id }`.
     - In `invoices.js`: ensure user cannot access, finalize, or delete invoices belonging to other businesses.
- **Verification:**
  Execute unauthenticated API requests and cross-user modification attempts to confirm strict 401/403/404 responses.

---

### Phase 3: Deterministic Rule Engine & Unit Testing
- **Target Files:**
  - `server/src/rules/gstRuleEngine.js`
  - `server/tests/ruleEngine.test.js`
- **Actions:**
  1. Add decimal-safe rounding and boundary checking.
  2. Implement structured test runner executing test cases for:
     - `RULE-GST-001`: Valid GSTIN, malformed state code, invalid PAN checksum, B2C unregistered.
     - `RULE-GST-002`: Missing mandatory metadata (invoice number, date, customer, items).
     - `RULE-GST-003`: 4/6/8-digit goods HSN vs 6-digit SAC (99xxxx) code verification.
     - `RULE-GST-004`: GST Council rate slabs (0%, 0.1%, 0.25%, 3%, 5%, 12%, 18%, 28%).
     - `RULE-GST-005`: Intra-state (CGST = SGST, IGST = 0) vs Inter-state (IGST = 100%, CGST = SGST = 0).
     - `RULE-GST-006`: Line item calculation integrity ((Qty × Price) - Discount = Taxable).
     - `RULE-GST-007`: Grand total aggregate reconciliation with ±0.05 currency tolerance.
     - `RULE-GST-008`: Duplicate invoice number detection within current tenant history.
     - `RULE-GST-009`: Non-negative constraints on price, quantity, and discount.
     - `RULE-GST-010`: Consignment value e-Way Bill threshold (> ₹50,000 under Rule 138).
- **Verification:**
  100% pass rate across all positive, negative, boundary, and exception unit test cases.

---

### Phase 4: Authoritative HSN/SAC Master & Rate Master
- **Target Files:**
  - `server/prisma/schema.prisma`
  - `server/src/services/hsnService.js`
  - `server/scripts/importHsnMaster.js`
- **Actions:**
  1. **Schema Extension:**
     Add `HsnMaster` and `GstRateMaster` models to `schema.prisma`.
  2. **Authoritative Data Ingestion:**
     Write a Node.js / Python batch importer that parses `HSN_SAC.xlsx`:
     - Ingests 21,935 HSN rows from `HSN_MSTR`.
     - Ingests 681 SAC rows from `SAC_MSTR`.
     - Sets classification level (2-digit Chapter, 4-digit Heading, 6-digit Sub-heading, 8-digit Tariff item).
     - Normalizes descriptions, removes duplicates, and marks CBIC source version.
  3. **High-Speed Indexed Search API:**
     Update `hsnService.js` to perform database queries with SQLite FTS / index lookups, falling back to cached in-memory structures for instant response times.
- **Verification:**
  Search queries for *"laptop"*, *"cement"*, *"8471"*, *"consulting"*, *"9983"* return official CBIC codes and statutory descriptions.

---

### Phase 5: Python Isolation Forest Pipeline Fix
- **Target Files:**
  - `ai_engine/anomaly_detector.py`
  - `server/src/services/aiService.js`
- **Actions:**
  1. **Fix Scikit-Learn Feature Name Warning:**
     In `anomaly_detector.py`, wrap sample vectors in `pd.DataFrame([sample_vector], columns=FEATURE_NAMES)` before calling `model.score_samples()` and `model.predict()`. This prevents warning messages on stdout.
  2. **Cross-Platform Python Command Detection:**
     In `aiService.js`, check whether `python3`, `python`, or `py` is available on the host system.
  3. **Dynamic Historical Baselines:**
     Pass tenant-specific historical metrics (customer historical average, category average, order frequency) from the database into feature extraction.
- **Verification:**
  Run direct Python inference and verify Node.js receives clean JSON with zero parse errors.

---

### Phase 6: Explainable AI (XAI) Attribution & Verification
- **Target Files:**
  - `ai_engine/anomaly_detector.py`
  - `server/src/services/aiService.js`
  - `client/src/components/invoice/ValidationReportModal.tsx`
- **Actions:**
  1. Ensure baseline-perturbation delta scores accurately sum to 100%.
  2. Map top contributing factors to verified human-readable labels:
     - *"Customer Historical Deviation"*
     - *"Product Category Price Variance"*
     - *"Unusual Discount Percentage"*
     - *"High-Value Consignment Bracket"*
  3. Verify that normal invoices (low risk) clearly display *"Compliant / Normal Baseline"* without false anomaly alerts.
- **Verification:**
  Inspect the UI validation modal to ensure attribution charts display actual mathematical weights rather than static demo figures.

---

### Phase 7: Complete Invoice Lifecycle & Programmatic PDF
- **Target Files:**
  - `server/src/routes/invoices.js`
  - `client/src/services/api.ts`
  - `client/src/pages/InvoiceHistory.tsx`
  - `client/src/components/invoice/InvoicePrintModal.tsx`
- **Actions:**
  1. **Add Invoice Edit & Revalidate Endpoints:**
     - `PUT /api/invoices/:id`: updates draft invoice details and re-computes line items.
     - `POST /api/invoices/:id/revalidate`: executes both Rule Engine and ML model, updates validation records, and transitions invoice state.
  2. **Add Programmatic PDF Download:**
     - Integrate `jspdf` and `html2canvas` directly in `InvoicePrintModal.tsx` so users can download an official PDF document with one click.
     - Add `GET /api/invoices/:id/pdf` on the backend for standard invoice data export.
- **Verification:**
  Create a draft invoice with an error, edit the invoice, trigger revalidation, finalize it, and download the resulting PDF.

---

### Phase 8: AI Workspace Agent Real Tool Binding
- **Target Files:**
  - `server/src/routes/agent.js`
  - `client/src/components/agent/AuthenticatedAgentWorkspace.tsx`
- **Actions:**
  1. Fix undefined variable bugs (`businessId` -> `user.id`).
  2. Import and bind real helper functions (`validateGstRules`, `analyzeInvoiceWithAI`).
  3. Replace fake batch file upload messages with real file parsing logic or explicit unsupported feature disclosure.
  4. Enforce confirmation before invoice finalization.
- **Verification:**
  Prompt the agent: *"Create an invoice for Rahul Enterprises for 5 laptops at ₹75,000 each"* and confirm database draft creation with working validation results.

---

### Phase 9: Automated Test Suite & Verification Matrix
- **Target Files:**
  - `server/tests/`
  - `TEST_CASES.md`
  - `TEST_RESULTS.md`
- **Actions:**
  1. Implement automated test scripts for TEST-001 through TEST-040.
  2. Run unit tests, API integration tests, calculation tests, and security tests.
  3. Compile actual terminal outputs into `TEST_RESULTS.md`.

---

### Phase 10: Production Deployment & Live Site Configuration
- **Target Files:**
  - `DEPLOYMENT_GUIDE.md`
  - `client/.env.local`
- **Actions:**
  1. Document exact configuration required on Vercel to bind `VITE_API_URL` to the public backend.
  2. Provide backend deployment manifests (Render / Railway / Fly.io / Docker).
  3. Verify cross-origin resource sharing (CORS) settings for production domains.

