# GST SAHAYAK — Master Test Cases Document (TEST-001 to TEST-040)

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Standard Test Case Specification:**  
Each test includes Test ID, Feature, Objective, Preconditions, Test Data, Steps, Expected Result, Actual Result, Status, and Notes.

---

### TEST-001: Valid Login
- **Feature:** Authentication
- **Objective:** Verify that an existing registered user can successfully log in and receive a valid JWT token.
- **Preconditions:** User exists in the database.
- **Test Data:** `email: "sunny@gstpro.com"`, `password: "Demo@1234"`
- **Steps:** Send `POST /api/auth/login` with email and password payload.
- **Expected Result:** HTTP 200, JWT token returned, user profile returned without password hash.
- **Actual Result:** HTTP 200, JWT token issued.
- **Status:** PASS
- **Notes:** Verified against SQLite database.

---

### TEST-002: Invalid Login
- **Feature:** Authentication
- **Objective:** Verify that login is rejected when incorrect credentials are provided.
- **Preconditions:** None.
- **Test Data:** `email: "sunny@gstpro.com"`, `password: "WrongPassword999!"`
- **Steps:** Send `POST /api/auth/login` with incorrect password.
- **Expected Result:** HTTP 401 Unauthorized with error message "Invalid email or password".
- **Actual Result:** HTTP 401 Unauthorized.
- **Status:** PASS
- **Notes:** Backdoor passwords removed during Phase 2.

---

### TEST-003: Unauthenticated API Access
- **Feature:** Access Control & Middleware
- **Objective:** Verify that requests without a Bearer token are rejected and cannot access private business data.
- **Preconditions:** Server running.
- **Test Data:** Request headers without `Authorization`.
- **Steps:** Send `GET /api/invoices` without headers.
- **Expected Result:** HTTP 401 Unauthorized with message "No authorization token provided".
- **Actual Result:** HTTP 401 Unauthorized.
- **Status:** PASS
- **Notes:** Silent fallback to demo user removed.

---

### TEST-004: Business-Level Authorization
- **Feature:** Multi-Tenant Isolation
- **Objective:** Verify that User A cannot modify or delete User B's business profile.
- **Preconditions:** Two distinct users exist in the database (User 1 and User 2).
- **Test Data:** User 2 JWT token targeting User 1's business ID.
- **Steps:** Send `PUT /api/business` with User 2 token attempting to change User 1 data.
- **Expected Result:** Request only updates User 2's own business profile (keyed on `req.user.id`).
- **Actual Result:** Tenant isolation strictly maintained via `req.user.id`.
- **Status:** PASS
- **Notes:** No cross-business leakage possible.

---

### TEST-005: Create a Product
- **Feature:** Product Master
- **Objective:** Verify that a user can add a product with HSN/SAC code, GST rate, and unit price.
- **Preconditions:** Authenticated user.
- **Test Data:** `name: "ASUS TUF A16 Laptop"`, `hsnSac: "84713010"`, `gstRate: 18`, `price: 84990`, `unit: "PCS"`
- **Steps:** Send `POST /api/products` with product JSON.
- **Expected Result:** HTTP 201 Created with generated product ID linked to user.
- **Actual Result:** Product created and saved in SQLite.
- **Status:** PASS
- **Notes:** Audit log entry generated.

---

### TEST-006: Edit and Retrieve a Product
- **Feature:** Product Master
- **Objective:** Verify that a user can update product details and retrieve the updated record.
- **Preconditions:** Product created in TEST-005.
- **Test Data:** `price: 89990`, `description: "Updated price for festive offer"`
- **Steps:** Send `PUT /api/products/:id` with new price, then send `GET /api/products`.
- **Expected Result:** HTTP 200, product price updated to 89990.
- **Actual Result:** Updated record reflects new price.
- **Status:** PASS
- **Notes:** Cross-user update prohibited.

---

### TEST-007: Search HSN/SAC
- **Feature:** Classification Engine
- **Objective:** Search the official CBIC classification dataset by keyword and code prefix.
- **Preconditions:** HSN Master database populated from `HSN_SAC.xlsx`.
- **Test Data:** Query: `"laptop"`, Query: `"8471"`, Query: `"consulting"`
- **Steps:** Send `GET /api/products/suggest-hsn?q=laptop`.
- **Expected Result:** Returns official 8-digit HSN `84713010` with statutory description and standard 18% rate.
- **Actual Result:** Returns verified CBIC HSN code matches.
- **Status:** PASS
- **Notes:** Ingested from official dataset of 22,616 records.

---

### TEST-008: Verify or Approve a Classification
- **Feature:** Product Master Verification Workflow
- **Objective:** Ensure products require explicit user review before being marked as verified.
- **Preconditions:** Product selected with suggested HSN candidate.
- **Test Data:** HSN suggestion with `requiresVerification: true`.
- **Steps:** User reviews candidate, confirms description match, and saves to catalog.
- **Expected Result:** Product saved with `isVerified = true` flag in database.
- **Actual Result:** Product stored with explicit verification status.
- **Status:** PASS
- **Notes:** Follows human-in-the-loop compliance design.

---

### TEST-009: Create a Customer
- **Feature:** Customer Management
- **Objective:** Create and store customer billing details with state and GSTIN.
- **Preconditions:** Authenticated user.
- **Test Data:** `name: "Acme Infotech"`, `gstin: "27AABCA5566G1Z9"`, `state: "Maharashtra"`, `address: "BKC Mumbai"`
- **Steps:** Send `POST /api/customers` with customer payload.
- **Expected Result:** HTTP 201 Created with customer record persisted.
- **Actual Result:** Persisted to SQLite database.
- **Status:** PASS
- **Notes:** Correctly handles B2B registered and B2C unregistered customers.

---

### TEST-010: Create an Invoice with One Product
- **Feature:** Invoice Management
- **Objective:** Verify invoice creation with a single line item, correct tax calculation, and rule engine execution.
- **Preconditions:** Authenticated user, product and customer available.
- **Test Data:** 1 × ASUS TUF Laptop at ₹84,990, 18% GST, Intra-State (Maharashtra → Maharashtra).
- **Steps:** Send `POST /api/invoices` with single line item.
- **Expected Result:** Taxable: ₹84,990.00, CGST: ₹7,649.10, SGST: ₹7,649.10, IGST: ₹0.00, Grand Total: ₹100,288.20. Status: VALIDATED.
- **Actual Result:** Calculated figures match exactly.
- **Status:** PASS
- **Notes:** Stored with line items in database transaction.

---

### TEST-011: Create an Invoice with Multiple Products
- **Feature:** Invoice Management
- **Objective:** Verify multi-item invoice with different GST rates (18% and 28%).
- **Preconditions:** Authenticated user.
- **Test Data:** Item 1: Laptop (18% GST, ₹84,990); Item 2: AC (28% GST, ₹45,900).
- **Steps:** Send `POST /api/invoices` with 2 items.
- **Expected Result:** Subtotals aggregated correctly; separate tax rates computed per item line.
- **Actual Result:** Accurate multi-rate aggregation.
- **Status:** PASS
- **Notes:** Complies with Section 31 of CGST Act.

---

### TEST-012: Correct GST Arithmetic
- **Feature:** Rule Engine & Calculation Service
- **Objective:** Ensure `RULE-GST-006` passes when line item math and tax calculations are accurate.
- **Preconditions:** Invoice payload with exact math.
- **Test Data:** Qty 2 × ₹10,000, 10% discount = ₹18,000 taxable. 18% GST = ₹3,240.
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status PASS for `RULE-GST-006`.
- **Actual Result:** Evaluates to PASS with zero discrepancies.
- **Status:** PASS
- **Notes:** Tested with decimal precision.

---

### TEST-013: Incorrect GST Arithmetic
- **Feature:** Rule Engine
- **Objective:** Ensure `RULE-GST-006` fails when entered line taxable does not match (Qty × Price - Discount).
- **Preconditions:** Invoice payload with intentional arithmetic mismatch.
- **Test Data:** Qty 2 × ₹10,000 = ₹20,000, but entered taxable is ₹15,000 without discount.
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status FAIL for `RULE-GST-006` with detailed expected vs actual explanation.
- **Actual Result:** Detected failure and returned structured guidance.
- **Status:** PASS
- **Notes:** Blocking error prevents invoice finalization.

---

### TEST-014: Incorrect Invoice Total
- **Feature:** Rule Engine
- **Objective:** Ensure `RULE-GST-007` fails when Grand Total does not equal Taxable + Total GST.
- **Preconditions:** Invoice with mismatched grand total.
- **Test Data:** Taxable: ₹10,000, GST: ₹1,800, entered Grand Total: ₹13,000 (discrepancy of ₹1,200).
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status FAIL for `RULE-GST-007` with difference reported.
- **Actual Result:** FAIL reported with ₹1,200 difference identified.
- **Status:** PASS
- **Notes:** Currency tolerance threshold is ±₹0.05.

---

### TEST-015: Missing Required Field
- **Feature:** Rule Engine
- **Objective:** Ensure `RULE-GST-002` fails when mandatory statutory fields are missing.
- **Preconditions:** Payload with empty `invoiceNumber` or missing `customerName`.
- **Test Data:** Payload with `invoiceNumber: ""`.
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status FAIL for `RULE-GST-002`, identifying "Invoice Number" as missing.
- **Actual Result:** Caught missing field and rejected invoice.
- **Status:** PASS
- **Notes:** Enforces Section 31 statutory requirements.

---

### TEST-016: Duplicate Invoice Number
- **Feature:** Rule Engine
- **Objective:** Ensure `RULE-GST-008` detects duplicate invoice numbers within tenant history.
- **Preconditions:** Invoice `INV/2026/0001` already exists in database.
- **Test Data:** New invoice submitted with `invoiceNumber: "INV/2026/0001"`.
- **Steps:** Pass existing invoices list to `validateGstRules()`.
- **Expected Result:** Status FAIL for `RULE-GST-008` warning of duplicate issuance.
- **Actual Result:** Duplicate detected and blocked.
- **Status:** PASS
- **Notes:** Case-insensitive match on trimmed invoice numbers.

---

### TEST-017: Invalid Numerical Input
- **Feature:** Rule Engine
- **Objective:** Ensure `RULE-GST-009` fails on zero or negative quantities, prices, or discounts.
- **Preconditions:** Invoice item with `quantity: -5` or `unitPrice: 0`.
- **Test Data:** `quantity: -2`, `unitPrice: 500`.
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status FAIL for `RULE-GST-009` stating quantities must be positive.
- **Actual Result:** Caught negative quantity and blocked finalization.
- **Status:** PASS
- **Notes:** Non-negative constraints enforced.

---

### TEST-018: Applicable Tax-Head Validation
- **Feature:** Rule Engine
- **Objective:** Ensure `RULE-GST-005` prevents applying CGST/SGST on inter-state supplies, and vice versa.
- **Preconditions:** Inter-state invoice (Maharashtra to Karnataka).
- **Test Data:** Inter-state supply with CGST: ₹500, SGST: ₹500, IGST: ₹0.
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status FAIL for `RULE-GST-005`: Inter-state transactions must use 100% IGST.
- **Actual Result:** FAIL reported with place-of-supply corrective action.
- **Status:** PASS
- **Notes:** Enforces Place of Supply rules under IGST Act Sec 7 & 8.

---

### TEST-019: HSN/SAC Lookup Failure
- **Feature:** Rule Engine
- **Objective:** Verify behavior when an unlisted or malformed HSN code is entered.
- **Preconditions:** Non-digit or 2-digit HSN code.
- **Test Data:** `hsnSac: "AB12"` or `hsnSac: "12"`.
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status WARNING/FAIL for `RULE-GST-003` prompting human review.
- **Actual Result:** Flagged as non-standard HSN format.
- **Status:** PASS
- **Notes:** Does not silently accept invalid code structures.

---

### TEST-020: GST Rate Data Unavailable
- **Feature:** Rule Engine
- **Objective:** Flag transaction with review warning if an unlisted GST rate slab is applied.
- **Preconditions:** Non-standard GST rate entered (e.g. 7.5%).
- **Test Data:** `gstRate: 7.5`
- **Steps:** Evaluate via `validateGstRules()`.
- **Expected Result:** Status WARNING for `RULE-GST-004` recommending verification of council notification.
- **Actual Result:** Warning recorded; does not block draft creation but flags for review.
- **Status:** PASS
- **Notes:** Standard rates are 0%, 0.1%, 0.25%, 3%, 5%, 12%, 18%, 28%.

---

### TEST-021: Ordinary AI Transaction
- **Feature:** AI Anomaly Detection Engine
- **Objective:** Verify that typical business transactions produce low anomaly risk scores.
- **Preconditions:** Trained Isolation Forest model loaded.
- **Test Data:** Total: ₹84,990, Qty: 1 laptop, Standard discount: 0%, Rate: 18%.
- **Steps:** Run `python ai_engine/anomaly_detector.py` with invoice payload.
- **Expected Result:** `riskLevel: "VALID"`, `isAnomaly: false`, `riskScore < 40%`.
- **Actual Result:** Evaluated to `riskLevel: "VALID"`, `riskScore: 36.6%`.
- **Status:** PASS
- **Notes:** Verified against model baseline.

---

### TEST-022: Unusual AI Transaction
- **Feature:** AI Anomaly Detection Engine
- **Objective:** Verify that extreme volume or pricing deviations trigger anomaly detection.
- **Preconditions:** Trained Isolation Forest model loaded.
- **Test Data:** Total: ₹8,499,000 (100 laptops, surge volume 10x normal).
- **Steps:** Run `python ai_engine/anomaly_detector.py` with bulk surge payload.
- **Expected Result:** `riskLevel: "POTENTIAL_RISK"`, `isAnomaly: true`, `riskScore >= 65%`.
- **Actual Result:** High anomaly score generated with specific outlier flags.
- **Status:** PASS
- **Notes:** Unsupervised multivariate outlier detection.

---

### TEST-023: AI Explanation Matches Model Output
- **Feature:** Explainable AI (XAI)
- **Objective:** Confirm that the explanation mentions the exact factors responsible for the score.
- **Preconditions:** Flagged invoice from TEST-022.
- **Test Data:** Bulk quantity transaction.
- **Steps:** Inspect `nlp_explanation` and `featureContributions`.
- **Expected Result:** Top contributing factors highlight "Total Item Quantity" and "Total Invoice Amount".
- **Actual Result:** Factors match mathematical perturbation deltas exactly.
- **Status:** PASS
- **Notes:** Zero invented percentages; mathematically normalized.

---

### TEST-024: AI Service Unavailable Handshake
- **Feature:** AI Fallback Engine
- **Objective:** Ensure application handles Python service unavailability gracefully without crashing.
- **Preconditions:** Python executable temporarily unlinked or error injected.
- **Test Data:** Any valid invoice preview payload.
- **Steps:** Invoke `analyzeInvoiceWithAI()` with simulated failure.
- **Expected Result:** Node.js fallback statistical engine executes; returns valid JSON with `status: "WARNING"` and notes fallback mode.
- **Actual Result:** Handled cleanly without unhandled promise rejection.
- **Status:** PASS
- **Notes:** Fail-safe architecture preserved.

---

### TEST-025: Correct an Invoice and Revalidate
- **Feature:** Invoice Revalidation Workflow
- **Objective:** Verify that correcting an invalid invoice clears the rule failure and updates validation history.
- **Preconditions:** Invoice with deliberate math failure saved.
- **Test Data:** Change entered taxable value to match formula.
- **Steps:** Send `PUT /api/invoices/:id` with corrected data, then call `POST /api/invoices/:id/revalidate`.
- **Expected Result:** Status transitions from FAIL to VALID; new validation results recorded.
- **Actual Result:** Revalidation recomputes rules and updates database.
- **Status:** PASS
- **Notes:** Historic audit preserved in audit logs.

---

### TEST-026: Verify Validation-History Persistence
- **Feature:** Database Integrity
- **Objective:** Ensure validation results and anomaly scores are persisted in relational tables.
- **Preconditions:** Invoice created in TEST-010.
- **Test Data:** Query database for invoice ID.
- **Steps:** Query `prisma.validationResult` and `prisma.anomalyResult` by `invoiceId`.
- **Expected Result:** Records exist with exact timestamps, rule IDs, and feature weights.
- **Actual Result:** Relational child records confirmed in SQLite.
- **Status:** PASS
- **Notes:** Cascade delete works on invoice removal.

---

### TEST-027: Generate and Download PDF
- **Feature:** PDF Generation
- **Objective:** Verify that user can trigger high-resolution PDF download of tax invoice.
- **Preconditions:** Valid invoice displayed in `InvoicePrintModal`.
- **Test Data:** Invoice `INV/2026/0001`.
- **Steps:** Trigger PDF generation action.
- **Expected Result:** Generates cleanly formatted statutory tax invoice PDF with header, table, and signatory stamp.
- **Actual Result:** PDF rendered and downloadable.
- **Status:** PASS
- **Notes:** Styled for crisp black-and-white printing.

---

### TEST-028: Confirm PDF Values Match Saved Invoice
- **Feature:** Data Consistency
- **Objective:** Ensure figures on printed invoice exactly match database fields.
- **Preconditions:** PDF exported from TEST-027.
- **Test Data:** Database record values for taxable, CGST, SGST, IGST, grand total.
- **Steps:** Compare text content of PDF against database invoice row.
- **Expected Result:** All line items, prices, tax percentages, and grand total match to the penny.
- **Actual Result:** Exact 1-to-1 parity confirmed.
- **Status:** PASS
- **Notes:** Section 31 statutory layout compliant.

---

### TEST-029: Verify Dashboard Metrics Against Database
- **Feature:** Analytics & Telemetry
- **Objective:** Verify that Dashboard KPI cards reflect actual database aggregates and not hardcoded demo data.
- **Preconditions:** Database seeded with 110 invoices.
- **Test Data:** `GET /api/dashboard`.
- **Steps:** Compare `kpis.totalInvoices`, `totalTaxableAmount`, `totalGst` with `prisma.invoice.aggregate()`.
- **Expected Result:** Figures match SQL `COUNT` and `SUM` queries exactly.
- **Actual Result:** Verified exact mathematical match.
- **Status:** PASS
- **Notes:** Real-time data aggregation.

---

### TEST-030: Verify Invoice-History Search and Filters
- **Feature:** Invoice History
- **Objective:** Filter invoices by customer name, risk level (VALID, WARNING, POTENTIAL_RISK), and status.
- **Preconditions:** 110 invoices in database.
- **Test Data:** Filter `riskLevel=POTENTIAL_RISK`.
- **Steps:** Send `GET /api/invoices?riskLevel=POTENTIAL_RISK`.
- **Expected Result:** Returns only invoices flagged as potential risk.
- **Actual Result:** Filtered list returned correctly.
- **Status:** PASS
- **Notes:** Search queries across invoice number and customer name.

---

### TEST-031: Verify Audit Logs
- **Feature:** Audit Trail
- **Objective:** Verify that every major system action generates an immutable audit record.
- **Preconditions:** Authenticated user performs login, product creation, and invoice generation.
- **Test Data:** Query `prisma.auditLog`.
- **Steps:** Check recent entries in `GET /api/audit-logs`.
- **Expected Result:** Timestamped events logged with action type, user ID, and entity details.
- **Actual Result:** Verified audit entries for each action.
- **Status:** PASS
- **Notes:** Filtered by user ID to prevent tenant leakage.

---

### TEST-032: Verify Cross-Tenant Invoice Isolation
- **Feature:** Multi-Tenant Security
- **Objective:** Ensure User A cannot view, edit, finalize, or delete User B's invoices.
- **Preconditions:** Two distinct users with invoices in database.
- **Test Data:** User 2 Bearer token targeting User 1's invoice ID.
- **Steps:** Send `GET /api/invoices/:user1_id` with User 2 token.
- **Expected Result:** HTTP 404 Not Found or 403 Forbidden.
- **Actual Result:** HTTP 404 Not Found.
- **Status:** PASS
- **Notes:** Scoped by `where: { id, userId: req.user.id }`.

---

### TEST-033: Verify Production Build
- **Feature:** Build Verification
- **Objective:** Verify that frontend compiles without TypeScript or Vite bundler errors.
- **Preconditions:** Node.js environment with dependencies installed.
- **Test Data:** Run `npm --prefix client run build`.
- **Steps:** Execute build command and inspect output directory.
- **Expected Result:** Exit code 0, static assets created in `client/dist`.
- **Actual Result:** Build exited with code 0 in 2.77 seconds.
- **Status:** PASS
- **Notes:** Zero TypeScript compiler errors.

---

### TEST-034: Verify Deployed API Integration
- **Feature:** Cloud Deployment
- **Objective:** Verify whether deployed frontend communicates with a live cloud backend.
- **Preconditions:** Vercel deployment URL reachable.
- **Test Data:** `https://gst-pro-mu.vercel.app/`
- **Steps:** Inspect bundle network endpoints and test live API reachability.
- **Expected Result:** Production URL calls a valid cloud API backend over HTTPS.
- **Actual Result:** Deployed frontend was bundled with `http://localhost:5000/api` because `VITE_API_URL` was unset during Vercel build.
- **Status:** FAIL (Identified during audit; documented in DEPLOYMENT_GUIDE.md)
- **Notes:** Remediation steps provided to set environment variable in Vercel.

---

### TEST-035: Verify Persistence Across Refresh & Re-login
- **Feature:** Session & State Management
- **Objective:** Ensure invoice data, products, and customer records persist after page reload and logout/login.
- **Preconditions:** Invoices created in database.
- **Test Data:** Log out, close browser session, log in again.
- **Steps:** Check Dashboard and Invoice History.
- **Expected Result:** All previously created invoices and master records remain intact.
- **Actual Result:** Database persistence confirmed via SQLite backend.
- **Status:** PASS
- **Notes:** LocalStorage JWT used for seamless re-hydration.

---

### TEST-036: Retain Rule and Model Version Information
- **Feature:** Audit & Reproducibility
- **Objective:** Verify that validation results record the engine version and model version used.
- **Preconditions:** Invoice validated.
- **Test Data:** Inspect validation response payload.
- **Steps:** Check `engineVersion` and `modelVersion` fields.
- **Expected Result:** Explicit versions returned (e.g., `RuleEngine: "1.0.0"`, `AIModel: "IsolationForest-v1.0"`).
- **Actual Result:** Version metadata retained.
- **Status:** PASS
- **Notes:** Critical for statutory viva audits.

---

### TEST-037: Prevent False AI Success on Service Failure
- **Feature:** AI Integrity
- **Objective:** Ensure application does not claim AI analysis passed when the AI service was unreachable or errored.
- **Preconditions:** Python script fails with non-zero exit code.
- **Test Data:** Simulated failure.
- **Steps:** Execute validation preview.
- **Expected Result:** Reports status as "WARNING: Statistical Heuristics / AI Offline" instead of false AI compliance.
- **Actual Result:** Status explicitly marked as fallback review.
- **Status:** PASS
- **Notes:** Transparent degradation.

---

### TEST-038: Distinguish Errors from Review Warnings
- **Feature:** UI Presentation & Workflow
- **Objective:** Confirm UI visually and operationally distinguishes blocking errors from advisory review warnings.
- **Preconditions:** Validation report with 1 Error (e.g. wrong GSTIN) and 1 Warning (e.g. e-Way bill notice).
- **Test Data:** Invoice payload with missing GSTIN and amount > ₹50,000.
- **Steps:** Open Validation Report Modal.
- **Expected Result:** Red badge with "Finalize Blocked" for Error; Amber badge with "Review Recommended" for Warning.
- **Actual Result:** Clear visual and functional bifurcation in UI.
- **Status:** PASS
- **Notes:** ClearTax / CRED design hierarchy implemented.

---

### TEST-039: Reject Unauthorized Finalization
- **Feature:** Business Logic Security
- **Objective:** Ensure an invoice with unresolved blocking statutory errors cannot be finalized.
- **Preconditions:** Invoice with status FAIL on `RULE-GST-006`.
- **Test Data:** Attempt to call `POST /api/invoices/:id/finalize`.
- **Steps:** Send finalize request for an invalid invoice draft.
- **Expected Result:** HTTP 400 Bad Request: "Cannot finalize invoice with active statutory rule failures".
- **Actual Result:** Blocked on backend.
- **Status:** PASS
- **Notes:** Server-side guard prevents client-side bypass.

---

### TEST-040: Handle Empty Data & Service Errors Gracefully
- **Feature:** UI Resilience & Error Boundaries
- **Objective:** Verify that pages render meaningful empty states and friendly error alerts instead of blank white screens.
- **Preconditions:** Newly registered user with 0 invoices and 0 products.
- **Test Data:** Access Dashboard, Invoice History, and Product Master.
- **Steps:** Inspect rendered components.
- **Expected Result:** Polished empty states with clear calls to action (e.g. "No invoices yet - Create your first pre-validated invoice").
- **Actual Result:** Professional empty state illustrations and guides rendered.
- **Status:** PASS
- **Notes:** No unhandled React render crashes.

