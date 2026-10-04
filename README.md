# GST Sahayak 🇮🇳
> **“Smarter Invoices. Safer Business.”**  
> A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection.

---

## 📌 One-Line USP
> *"GST Sahayak combines GST rule-based validation with Explainable AI to detect potential invoice risks before finalization and clearly explain what needs to be verified."*

---

## 🚀 Key Features & Modules

### 1. 🔐 User Authentication & Split-Screen Portal
- Enterprise split-screen layout with value highlights and JWT token authentication.
- **One-Click Instant Demo Login** for quick review (`Sunny Gupta` / `sunny@gstpro.com`).

### 2. 📊 Dynamic Business Dashboard
- **Top KPI Telemetry Cards**: Total Invoices, Validated, Warnings, Risks Found, Anomalies Detected, Net Taxable Volume, and Total GST Assessed.
- **Visual Analytics**:
  - Monthly turnover & tax collection bar charts.
  - Donut chart of validation risk distributions.
- **Recent Invoices Registry**: Live table with deep inspection and print actions.

### 3. 🏢 Business Profile & Statutory Registration
- Stores Legal Name, GSTIN with live format & checksum validation (State Code prefix verification).
- Categorization, Registration Type (Regular/Composition/SEZ), and registered place of business.

### 4. 📦 Product Master & AI HSN/SAC Assistant
- Full product & service catalog with pricing, standard tax rates, and unit classifications.
- **AI HSN/SAC Auto-Assistant**: Enter items like *"ASUS TUF A16"* or *"Software Consulting"* to get live statutory HSN code suggestions with confidence scores and mandatory human verification.

### 5. 🧾 4-Step Create Invoice Wizard
- **Step 1 — Invoice Information**: Auto-incremented serial number and fiscal date.
- **Step 2 — Customer & Place of Supply**: Auto-detects **Intra-State** (CGST + SGST) vs **Inter-State** (IGST) tax applicability based on supplier and recipient states.
- **Step 3 — Products & Real-time Tax Engine**: Multi-item rows, discounts, and real-time subtotal, taxable base, CGST/SGST/IGST, and grand total computations.
- **Step 4 — Review & Pre-Validation**: Complete pre-flight check before saving.

### 6. ⚙️ Deterministic GST Rule Engine
Configurable deterministic compliance checks:
- `RULE-GST-001`: 15-character GSTIN format & PAN checksum validation.
- `RULE-GST-002`: Mandatory statutory field presence.
- `RULE-GST-003`: HSN/SAC format & standard digit lengths.
- `RULE-GST-004`: GST Council rate slab consistency (0%, 5%, 12%, 18%, 28%).
- `RULE-GST-005`: Place of Supply tax logic (CGST/SGST 50-50 vs 100% IGST).
- `RULE-GST-006`: Line item arithmetic integrity.
- `RULE-GST-007`: Grand total aggregate reconciliation.
- `RULE-GST-008`: Duplicate invoice sequence protection.
- `RULE-GST-009`: Non-negative value constraints.
- `RULE-GST-010`: E-Way bill threshold check (> ₹50,000 consignment value).

### 7. 🤖 Scikit-Learn AI Anomaly Detection Engine
- Powered by an **Isolation Forest** unsupervised machine learning model trained on historical multivariate transaction features (Invoice amount, taxable value, quantity, unit price deviations, discount anomalies, and transaction frequency).
- Normalized **0-100% AI Risk Score** and classification tier (🟢 *Valid*, 🟠 *Warning*, 🔴 *Potential Risk*).

### 8. 💡 Explainable AI (XAI) & SHAP Attributions
- Transparent natural-language explanations of *Why* an invoice was flagged.
- **SHAP-inspired feature attribution weights** displaying the exact percentage contribution of each transaction factor to the anomaly risk score.
- Clear, actionable guidance on verification steps.

### 9. 📋 Invoice History & Search
- Search by invoice number, customer name, or GSTIN.
- Filter by Risk Tier (Valid, Warning, Potential Risk) and status.
- Direct actions: View Explainable AI audit, finalize invoice, print statutory PDF invoice.

### 10. 📈 Anomaly Dashboard
- Transaction distribution histogram across price tiers.
- Category-wise anomaly incidence analysis.
- Dedicated registry of high-risk outlier transactions.

### 11. 📑 Reports & Tax Schedules
- Invoice turnover summary.
- Statutory GST tax breakdown (CGST, SGST, IGST).
- GST rate slab turnover tables.
- Aggregated rule failure diagnostic logs.

### 12. 🛡️ Admin / GST Rules & Audit Trails
- Enable/disable rules dynamically.
- Edit severity levels (`ERROR`, `WARNING`, `INFO`).
- Add custom validation rules.
- Timestamped audit log of all system actions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | SQLite / PostgreSQL (Prisma) |
| **AI / Machine Learning** | Python 3, Scikit-learn (Isolation Forest), Pandas, NumPy, Joblib |
| **Authentication** | JWT & Bcrypt |

---

## 🏃 Running the Application

### 1. Start Backend Server
```bash
cd server
npm install
npm run prisma:push
npm run seed
node src/index.js
```
*Backend runs on: `http://localhost:5000`*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

### 3. Demo Credentials
- **Email:** `sunny@gstpro.com`
- **Password:** `demo1234`
*(Or click the **One-Click Instant Demo Login** button on the sign-in page)*
