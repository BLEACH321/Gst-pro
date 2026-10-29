# GST SAHAYAK — Comprehensive Project Audit Report

**Project Title:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Tagline:** Smarter Invoices. Safer Business.  
**Live Deployed Frontend:** [https://gst-pro-mu.vercel.app/](https://gst-pro-mu.vercel.app/)  
**Date of Audit:** October 2026  
**Auditor:** Senior Full-Stack & System Validation Engineer (Antigravity AI)  

---

## 1. Executive Summary

An exhaustive technical audit of the **GST Sahayak** codebase, database schema, rule engine, machine learning pipeline, client user interface, and live deployment was conducted. 

GST Sahayak is built on a modern stack:
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend:** Node.js (ES Modules), Express.js, Prisma ORM, SQLite (`dev.db`).
- **AI / ML Engine:** Python 3, Scikit-learn (`IsolationForest`), NumPy, Pandas, Joblib.

### Key Finding:
The application possesses strong architectural foundations:
1. The **Deterministic Rule Engine** (`server/src/rules/gstRuleEngine.js`) already implements 10 fundamental GST validation rules.
2. The **Python Isolation Forest Engine** (`ai_engine/anomaly_detector.py`) is fully written with mathematical baseline-perturbation feature attributions and trained model serialization (`isolation_forest.joblib`).
3. The **UI/UX** is exceptionally polished, featuring modern cyber-slate aesthetics, high-density telemetry dashboards, and interactive modals.

However, critical runtime flaws, security backdoors, missing CRUD routes, disconnected data pipelines, and a misconfigured live deployment prevent the project from operating as a reliable production system in its current state.

---

## 2. Feature-by-Feature Status Breakdown

| Feature / Module | Status | Severity | Summary & Root Cause |
|---|---|---|---|
| **User Authentication** | ⚠️ Partially Functional | **Critical Security Bug** | Passwords hashed with bcrypt, but `auth.js` has hardcoded backdoor bypasses (`password === "demo1234"`). If email/password are empty, it auto-authenticates as the first DB user. |
| **Auth Middleware & Access Control** | ❌ Broken / Vulnerable | **Critical Security Bug** | In `server/src/middleware/auth.js`, if no token or an invalid token is provided, it silently sets `req.user` to the first user in SQLite. Unauthenticated requests bypass all security! |
| **Business Profile** | ✅ Fully Functional | Low | `GET /api/business` and `PUT /api/business` work properly with upsert logic. |
| **Product Master** | ⚠️ Partially Functional | High | Products can be created, listed, edited, and deleted. However, `PUT` and `DELETE` endpoints do not verify user ownership (`where: { id }` instead of `{ id, userId }`). |
| **Customer Directory** | ⚠️ Partially Functional | Medium | `GET /api/customers` and `POST /api/customers` exist. `PUT` (edit) and `DELETE` endpoints are completely missing. |
| **HSN/SAC Master & Search** | 🔶 UI-only / Hardcoded | High | A hardcoded array of only 16 items exists in `hsnService.js`. Meanwhile, 22,616 official CBIC codes in `HSN_SAC.xlsx` sit unused in the root directory! |
| **GST Rate Master** | ❌ Missing | High | No dedicated rate table exists in Prisma schema. Rates are freeform floats on products without effective dates or statutory verification. |
| **Invoice Creation & Wizard** | ✅ Functional | Medium | 4-step wizard correctly calculates taxable values, CGST, SGST, IGST, and saves invoices with line items and validation results. |
| **Invoice Editing & Revalidation** | ❌ Missing | High | There is no `PUT /api/invoices/:id` or `POST /api/invoices/:id/revalidate`. Once created, drafts cannot be edited or re-validated via API. |
| **Invoice Finalization** | ✅ Functional | Low | `POST /api/invoices/:id/finalize` marks status as `FINALIZED` and writes an audit log. |
| **Deterministic GST Rule Engine** | ✅ Functional | Low | Implements 10 rules (GSTIN, mandatory fields, HSN format, rate slabs, place-of-supply tax head, line arithmetic, total reconciliation, duplicates, negative numbers, e-way bill). |
| **Python Isolation Forest Engine** | ⚠️ Partially Functional | High | The model code is real, but Node.js `aiService.js` fails to parse its output because scikit-learn prints unsuppressed `UserWarning` to stdout/stderr. Node silently falls back to JS heuristics! |
| **Explainable AI (XAI) Attribution** | ✅ Functional | Medium | Perturbation-based attribution calculates percentage risk contribution for each feature and generates structured NLP reasons. |
| **Dashboard KPIs & Charts** | ✅ Functional | Low | Aggregates actual invoice metrics from Prisma for the logged-in user. |
| **Anomaly Dashboard** | ✅ Functional | Low | Displays risk distribution, category breakdown, and flagged invoices. |
| **Invoice PDF Generation** | ⚠️ Partially Functional | Medium | Prints using browser print dialog (`window.print()`). Direct programmatic PDF export (`jspdf`) and backend PDF route are not connected. |
| **Audit Logs** | ⚠️ Partially Functional | Medium | Logs actions (login, register, invoice creation, rules). However, `GET /api/audit-logs` returns all users' logs instead of filtering by `userId`. |
| **AI Workspace Agent** | ❌ Broken / Simulated | High | Agent route references undefined variables (`businessId` instead of `user.id`), calls undeclared functions (`runRuleValidation`, `runAnomalyDetectionOnInvoice`), and simulates file imports with fake hardcoded stats. |
| **Income Tax Portal** | ⚠️ Separate Module | Low | 2,100+ lines of standalone ITR calculator. High utility, but separate from the core GST Sahayak hybrid validation workflow. |
| **Live Deployed Website** | ❌ Broken API Integration | **Critical Deployment Flaw** | `https://gst-pro-mu.vercel.app/` was built with default `VITE_API_URL="http://localhost:5000/api"`. Deployed frontend tries to reach visitor's localhost and fails with network/mixed-content errors. |

---

## 3. Deep-Dive Audit of Specific Modules

### 3.1 Authentication & Security (`server/src/routes/auth.js` & `server/src/middleware/auth.js`)
1. **Critical Authentication Bypass:**
   In `server/src/middleware/auth.js` lines 11-19:
   ```javascript
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
     const demoUser = await prisma.user.findFirst({ include: { business: true } });
     if (demoUser) {
       req.user = demoUser;
       return next();
     }
     return res.status(401).json({ error: "No authorization token provided" });
   }
   ```
   If a client makes any request without an `Authorization` header, the server automatically assumes the identity of `demoUser` (the first user in the database)!
2. **Backdoor Login Credentials:**
   In `server/src/routes/auth.js` line 123:
   ```javascript
   if (!isMatch && password !== "demo1234" && password !== "admin123") {
     return res.status(401).json({ error: "Invalid email or password" });
   }
   ```
   Any user account in the system can be accessed using `demo1234` or `admin123` regardless of their actual password hash.
3. **Empty Login Shortcut:**
   In `server/src/routes/auth.js` lines 95-111:
   Submitting `{ email: "", password: "" }` issues a signed 7-day JWT token for the first user in the database.
4. **Data Isolation Violation in Audit Logs:**
   In `server/src/routes/auditLogs.js` line 11:
   ```javascript
   const logs = await prisma.auditLog.findMany({ take: 50, orderBy: { createdAt: "desc" } });
   ```
   There is no `where: { userId: req.user.id }`. Any authenticated user can view audit records from every other user on the system.

---

### 3.2 Product and Customer Management (`server/src/routes/products.js`, `customers.js`)
1. **Product Cross-Tenant Authorization:**
   In `server/src/routes/products.js` lines 94 and 127:
   ```javascript
   await prisma.product.update({ where: { id }, data: { ... } });
   await prisma.product.delete({ where: { id } });
   ```
   The `where` clause lacks `userId: req.user.id`. A user who knows another tenant's product `id` can overwrite or delete it.
2. **Customer Management Incomplete:**
   `server/src/routes/customers.js` only provides `GET /` and `POST /`. There are no routes to update or delete customer details.

---

### 3.3 HSN/SAC Classification & GST Rate Data (`server/src/services/hsnService.js`)
1. **Hardcoded In-Memory Catalog:**
   `hsnService.js` currently stores 16 hardcoded JavaScript objects.
2. **Unused Authoritative Datasets:**
   The repository contains:
   - `HSN_SAC.xlsx` (668 KB) with:
     - `HSN_MSTR`: 21,935 verified CBIC HSN codes.
     - `SAC_MSTR`: 681 verified CBIC SAC service codes.
   - `HSN_SAC - HSN_MSTR.pdf` (1.2 MB)
   - `HSN_SAC.pdf` (4.3 MB)
3. **Missing Database Tables:**
   Prisma schema has no `HsnMaster` or `GstRateMaster` model. Products store free-text HSN strings without foreign-key validation or verification status flags.

---

### 3.4 AI Anomaly Detection Pipeline (`ai_engine/anomaly_detector.py` & `aiService.js`)
1. **Scikit-Learn Warning Breaks JSON Parsing:**
   In `ai_engine/anomaly_detector.py`:
   The Isolation Forest was fitted on a DataFrame with column names `FEATURE_NAMES`. During inference, raw python lists `[sample_vector]` are passed to `model.score_samples()`, causing scikit-learn to emit:
   ```
   UserWarning: X does not have valid feature names, but IsolationForest was fitted with feature names
   ```
   This text is printed before the JSON output. In `server/src/services/aiService.js`:
   ```javascript
   const parsed = JSON.parse(stdoutData.trim());
   ```
   `JSON.parse` crashes with `SyntaxError: Unexpected token 'C'`, triggering the catch block and falling back to Node.js hardcoded heuristics. The real trained ML model is thus bypassed!
2. **Executable Name Portability:**
   `aiService.js` calls `spawn("py", [SCRIPT_PATH])`. On many Linux environments, macOS, and custom Windows setups, `py` does not exist; `python3` or `python` is standard.
3. **Model Feature Inputs:**
   The model extracts 13 features:
   `invoice_amount`, `taxable_amount`, `gst_amount`, `gst_rate_avg`, `quantity_total`, `discount_rate`, `item_count`, `unit_price_avg`, `unit_price_max`, `deviation_from_customer_avg`, `deviation_from_category_avg`, `inter_state_flag`, `frequency_score`.
   These features are well chosen, but category and customer baselines need persistent calculation from database history rather than hardcoded 55,000 baseline constants.

---

### 3.5 AI Workspace Agent (`server/src/routes/agent.js`)
1. **Schema Mismatch & Crashes:**
   In `agent.js` line 82: `const businessId = user.businessId;`. User has no `businessId` in Prisma schema; `Customer` and `Product` also do not have `businessId` (they have `userId`).
2. **Missing Function Declarations:**
   In `agent.js` lines 247 & 258:
   `runRuleValidation` and `runAnomalyDetectionOnInvoice` are called but are never imported or declared in `agent.js`, causing immediate runtime exceptions (`ReferenceError`).
3. **Fake Hardcoded Import Simulation:**
   Tool D claims: *"Extracted 124 product rows... 118 rows passed HSN format; 6 require human verification."* This is entirely hardcoded and does not parse files.

---

### 3.6 Live Deployment Issue (`https://gst-pro-mu.vercel.app/`)
1. **Frontend Baked with Localhost URL:**
   Inspection of the compiled JavaScript bundle (`index-BlHNIFXv.js`) on the live Vercel domain reveals:
   `API_BASE = "http://localhost:5000/api"`.
   Because no `VITE_API_URL` environment variable was set in Vercel project settings, the deployed website attempts to make XHR/fetch requests to `http://localhost:5000/api`. On client browsers, this causes `ERR_CONNECTION_REFUSED` and mixed-content blocking.
2. **No Deployed Backend:**
   The backend server is currently only hosted locally on SQLite. For the live site to work independently, a publicly reachable backend or mock-mode bridge must be configured.

---

## 4. Verification Checkpoint Summary

- [x] Codebase structure audited across client, server, and ai_engine.
- [x] Frontend builds cleanly with zero TypeScript errors (`tsc -b && vite build`).
- [x] Python environment tested and verified with Scikit-learn Isolation Forest.
- [x] Official HSN/SAC dataset discovered (`HSN_SAC.xlsx` with 22,616 records).
- [x] Critical security and authentication flaws identified and isolated.
- [x] Live deployment mismatch diagnosed.

