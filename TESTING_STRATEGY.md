# GST SAHAYAK — Testing Strategy & Quality Assurance Framework

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Purpose:** Comprehensive QA strategy for academic evaluation, viva presentation, and production reliability.  

---

## 1. Testing Philosophy & Objectives

GST Sahayak is a mission-critical financial decision-support tool. Because commercial invoices carry legal and statutory compliance consequences under the Indian Goods and Services Tax (GST) Act, the testing strategy adheres to three non-negotiable principles:

1. **Zero Hallucination for Statutory Rules:**
   GST legal provisions (tax rates, place of supply, mandatory fields, invoice arithmetic) are strictly deterministic. They are tested via boundary value analysis and exhaustive unit tests—never delegated to probabilistic models.
2. **Explainable & Bounded AI Evaluation:**
   The Machine Learning Anomaly Detector (Isolation Forest) is evaluated using statistical outlier benchmarks on controlled synthetic distributions. Anomaly detection is tested for feature attribution consistency and gracefully handled when the ML engine is offline.
3. **Multi-Tenant Security & Isolation:**
   Every API endpoint is tested against unauthorized cross-tenant data access, session tampering, and privilege escalation.

---

## 2. Test Classification Levels

```
               ┌───────────────────────────────┐
               │    End-to-End (E2E) Tests     │ Complete 17-step user workflow
               ├───────────────────────────────┤
               │   API & Integration Tests     │ REST routes, JWT auth, DB persistence
               ├───────────────────────────────┤
               │   AI / ML Anomaly Benchmarks  │ Isolation Forest, attributions, SHAP
               ├───────────────────────────────┤
               │   Rule Engine Unit Tests      │ RULE-GST-001 through 010
               ├───────────────────────────────┤
               │ Static Analysis & Type Safety │ TypeScript, Oxlint, Python AST
               └───────────────────────────────┘
```

---

## 3. Test Layers & Methodologies

### 3.1 Static Code Analysis & Type Safety
- **Tools:** TypeScript compiler (`tsc -b`), Oxlint (`oxlint`), Node.js ES Modules validator.
- **Coverage:**
  - Strict type checking on all frontend components and API client services.
  - Zero unused variable warnings or dead code paths.
  - JSON schema conformance on request/response payloads.

### 3.2 GST Calculation & Decimal Integrity Tests
- **Objective:** Prevent IEEE-754 binary floating-point rounding drift in financial figures.
- **Rules Tested:**
  - Line Item Taxable: `Math.max(0, (Quantity × UnitPrice) - Discount)`
  - Intra-State Tax Split: Exactly 50% CGST and 50% SGST rounded to 2 decimal places.
  - Inter-State Tax: Exactly 100% IGST rounded to 2 decimal places.
  - Grand Total: `TaxableBase + TotalGst` with maximum ±₹0.05 rounding boundary tolerance.

### 3.3 Rule Engine Unit Testing
- Each rule in `server/src/rules/gstRuleEngine.js` is tested in isolation against:
  - **Nominal Passing Scenario:** Standard compliant parameters.
  - **Failing Scenario:** Explicit violation triggering error status.
  - **Boundary Scenario:** Exact boundary conditions (e.g., invoice value exactly ₹50,000 vs ₹50,000.01 for e-Way Bill rule).
  - **Edge Case Scenario:** Zero discounts, B2C unregistered customer, composite line items.

### 3.4 AI Anomaly Detection Evaluation
- **Model:** Isolation Forest (`n_estimators=100`, `contamination=0.15`).
- **Feature Vector:** 13 multivariate numerical features.
- **Metrics Evaluated:**
  - Anomaly classification consistency between normal transactions and high-risk outliers.
  - Perturbation-based attribution normalization (weights sum to 100%).
  - Graceful degradation: Fallback to JS heuristics when Python service is unavailable without throwing unhandled exceptions.

### 3.5 Security & Authorization Testing
- **Vulnerabilities Tested:**
  - Token-less requests: Must return `401 Unauthorized`.
  - Spoofed / expired tokens: Must return `401 Unauthorized`.
  - Cross-Tenant Modification: User A attempting to update or delete User B's product, customer, or invoice must return `404 Not Found` or `403 Forbidden`.
  - Sensitive Data Leakage: Verify no passwords, password hashes, or internal database connection strings are exposed in API outputs or audit logs.

### 3.6 End-to-End (E2E) Workflow Validation
Executes the full business journey:
```
Login
  → Create Business Profile
  → Search HSN/SAC Master (e.g., "84713010")
  → Add Product to Catalog
  → Add Customer (Intra or Inter-State)
  → Create Draft Invoice
  → Calculate Tax Breakdown
  → Run Pre-Validation (Rule Engine + AI)
  → Inspect Explainable AI Attribution
  → Correct Discrepancy & Revalidate
  → Finalize Invoice
  → Print / Download PDF
  → Verify Database Persistence & Dashboard Telemetry
```

---

## 4. Test Execution Criteria

| Metric | Target | Action on Failure |
|---|---|---|
| **TypeScript Build** | 0 errors | Block build immediately |
| **Rule Engine Pass Rate** | 100% | Block deployment; fix deterministic rule math |
| **Security Auth Checks** | 100% pass | Treat as P0 critical vulnerability |
| **AI Fallback Handshake** | Clean JSON | Inspect Python stderr/stdout warning streams |
| **Currency Reconciliation** | Max ±₹0.05 drift | Check decimal rounding logic |

