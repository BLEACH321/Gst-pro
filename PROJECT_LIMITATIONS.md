# GST SAHAYAK — Project Scope, Boundaries & Statutory Limitations

**Project Title:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Purpose:** Clear disclosure of technical boundaries, regulatory assumptions, and scope limitations for academic evaluation and college project defense.  

---

## 1. Regulatory & Legal Disclaimer

1. **Decision Support, Not Legal Immunity:**
   GST Sahayak is an intelligent pre-validation and risk-scoring tool designed to assist businesses, accounts departments, and tax consultants in identifying potential errors *before* filing. Passing all GST Sahayak checks **does not constitute a government certification or legal guarantee** of complete GST compliance.
2. **Not a Replacement for Tax Professionals:**
   The application is intended to reduce clerical errors and catch commercial outliers; it does not replace the professional judgment of Chartered Accountants, legal counsel, or statutory tax auditors.
3. **Not an Official GSTN Filing Node:**
   GST Sahayak does not connect directly to the Government Goods and Services Tax Network (GSTN) to lodge official monthly returns (GSTR-1, GSTR-3B) or generate signed IRN barcodes unless configured with an official GST Suvidha Provider (GSP) or ASP gateway.

---

## 2. Technical & Domain Limitations

### 2.1 GSTIN Format vs Live GSTN Status
- **What the system does:** Performs statutory 15-character regular expression and state code validity checks (`RULE-GST-001`).
- **Limitation:** The system verifies that a GSTIN conforms to the legal structure and valid state code prefixes. However, without an active paid subscription to an official government GSP API (e.g. NIC or GSTN Sandbox), the system cannot check whether the GSTIN is active, cancelled, suspended, or whether the taxpayer is currently delinquent on return filings.

### 2.2 Synthetic Machine Learning Dataset Scope
- **What the model does:** An Isolation Forest model trained on a controlled multivariate dataset (13 financial and volume features) detects statistical deviations from standard commercial distributions.
- **Limitation:** Real corporate financial transactions are protected by banking secrecy and privacy laws. The model is trained on a synthetic baseline of small-to-medium enterprise (SME) sales. In an enterprise production deployment, the model would need to be re-calibrated on the specific enterprise's historical transaction books.

### 2.3 Statistical Anomaly $\neq$ Tax Fraud
- **What the model does:** Flags transactions whose volume, amount, or discount deviate significantly from historical averages.
- **Limitation:** An unusual transaction is not necessarily fraudulent. For example, a business securing an annual enterprise software contract for ₹25,00,000 may deviate drastically from its average ₹50,000 retail invoices, yet the transaction is 100% legitimate. The system treats all high risk scores strictly as **"Review Recommended"** and never labels a transaction as "Fraud Confirmed".

### 2.4 Classification & Tax Rate Complexity
- **What the system does:** Provides search over 22,600+ CBIC HSN and SAC codes and matches standard council rate slabs (0%, 5%, 12%, 18%, 28%).
- **Limitation:** GST classifications often involve complex legal nuances (e.g., whether goods are packaged vs unpackaged, branded vs unbranded, or composite vs mixed supplies). The AI HSN Assistant explicitly marks every candidate code with `requiresVerification: true` to require human sign-off before saving.

### 2.5 Runtime Subprocess Dependency
- **What the system does:** The Node.js Express server invokes the Python Scikit-learn engine via a standard input/output subprocess bridge.
- **Limitation:** If Python is not installed on the host machine, the server falls back to an integrated JavaScript heuristic scoring engine. While the system remains operational, the statistical depth is reduced compared to the full 100-tree Isolation Forest model.

---

## 3. Recommended Future Enhancements

1. **Integration with GSTN GSP/ASP APIs:** Connect to live government APIs for live GSTIN verification and automated IRN (Invoice Reference Number) generation.
2. **Semi-Supervised Active Learning:** Allow Chartered Accountants to mark flagged invoices as "Verified Legitimate" to dynamically update the anomaly baseline and prevent recurring false positives.
3. **Direct PDF OCR Ingestion:** Use computer vision and layout analysis to parse incoming vendor invoices directly from scanned paper receipts.

