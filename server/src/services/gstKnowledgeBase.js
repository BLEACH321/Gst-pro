/**
 * Comprehensive GST Statutory Knowledge Base & Natural Language Query Resolver
 * Covers all functions, rules, sections, thresholds, return filing, ITC, RCM,
 * e-invoicing, e-way bills, audit, and platform integrations for GST in India.
 */

export const GST_KNOWLEDGE_BASE = [
  // 1. GST FUNDAMENTALS & ARCHITECTURE
  {
    id: "gst-overview",
    topics: ["what is gst", "gst meaning", "how gst works", "dual gst", "cgst", "sgst", "igst", "utgst", "types of gst"],
    title: "Goods and Services Tax (GST) Architecture in India",
    content: `**Goods and Services Tax (GST)** is a destination-based, multi-stage consumption tax levied on the supply of goods and services across India, governed by the GST Council under Article 246A of the Indian Constitution.

### 1. Dual GST Structure
India operates a dual GST model where both Central and State Governments administer taxes simultaneously:
* **CGST (Central GST)**: Levied by the Central Government on **intra-state** transactions (supplies within the same state).
* **SGST (State GST) / UTGST (Union Territory GST)**: Levied by the State or UT Government on **intra-state** transactions.
* **IGST (Integrated GST)**: Levied by the Centre under the IGST Act on **inter-state** transactions (supplies between different states, as well as imports and exports).

### 2. Standard Tax Slabs
* **0% (Exempt)**: Unbranded basic food staples, milk, fresh vegetables, healthcare, basic education.
* **5%**: Essential packaged food, standard medicines, rail freight, economy air tickets.
* **12%**: Business class air travel, processed foods, specific agricultural machinery.
* **18% (Standard Rate)**: IT hardware, electronics, software, professional services, restaurants (air-conditioned), telecom.
* **28% + Compensation Cess**: Luxury cars, aerated drinks, pan masala, and demerit goods.`
  },

  // 2. REGISTRATION RULES & THRESHOLDS
  {
    id: "gst-registration",
    topics: ["registration", "gst threshold", "turnover limit", "who must register", "mandatory registration", "section 22", "section 24"],
    title: "GST Registration Rules & Turnover Thresholds",
    content: `GST registration is governed by **Section 22** (Turnover Thresholds) and **Section 24** (Compulsory Registration) of the CGST Act.

### 1. Aggregate Turnover Thresholds (Section 22)
* **Goods (Normal Category States)**: **₹40 Lakhs** aggregate annual turnover.
* **Services (Normal Category States)**: **₹20 Lakhs** aggregate annual turnover.
* **Special Category States** (Manipur, Mizoram, Nagaland, Tripura): **₹10 Lakhs** (for goods & services).
* **Other Special States** (Assam, Meghalaya, Sikkim, Uttarakhand, Himachal Pradesh, J&K): **₹20 Lakhs**.

### 2. Mandatory Registration regardless of Turnover (Section 24)
Registration is compulsory with **zero turnover exemption** for:
1. Persons making any **inter-state taxable supply** of goods.
2. **Casual taxable persons** and Non-resident taxable persons making taxable supply.
3. Persons required to pay tax under **Reverse Charge Mechanism (RCM)**.
4. **E-commerce operators** (Amazon, Flipkart) and sellers supplying through e-commerce portals.
5. Tax deductors (TDS u/s 51) and Tax collectors (TCS u/s 52).
6. Input Service Distributors (ISD) and OIDAR service providers.`
  },

  // 3. COMPOSITION SCHEME (SECTION 10)
  {
    id: "composition-scheme",
    topics: ["composition scheme", "composition levy", "section 10", "cmp-08", "gstr-4", "flat rate"],
    title: "GST Composition Scheme (Section 10)",
    content: `The **Composition Scheme** is a simplified compliance mechanism designed for small traders, manufacturers, and service providers.

### 1. Eligibility & Turnover Limits
* **Goods (Manufacturers & Traders)**: Aggregate annual turnover up to **₹1.5 Crores** (₹75 Lakhs for Special Category States).
* **Services / Mixed Suppliers (Section 10(2A))**: Turnover up to **₹50 Lakhs**.

### 2. Tax Rates under Composition
* **Manufacturers**: 1% (0.5% CGST + 0.5% SGST) of turnover in state.
* **Traders (Goods)**: 1% (0.5% CGST + 0.5% SGST) of **taxable** turnover.
* **Restaurants (Non-alcoholic)**: 5% (2.5% CGST + 2.5% SGST).
* **Service Providers u/s 10(2A)**: 6% (3% CGST + 3% SGST).

### 3. Key Restrictions
* **Cannot issue Tax Invoices**: Must issue a **Bill of Supply** with the text *"Composition taxable person, not eligible to collect tax on supplies"*.
* **No Input Tax Credit (ITC)**: Cannot claim ITC on purchases, and customers cannot claim ITC on composition supplies.
* **No Inter-State Sales**: Cannot make inter-state outward supplies of goods.`
  },

  // 4. PLACE OF SUPPLY RULES
  {
    id: "place-of-supply",
    topics: ["place of supply", "pos", "inter-state vs intra-state", "how to determine igst", "section 10 igst", "section 12 igst"],
    title: "Place of Supply & Tax Classification (Intra-State vs Inter-State)",
    content: `The **Place of Supply (PoS)** determines whether a transaction attracts **CGST + SGST** (Intra-State) or **IGST** (Inter-State) under the IGST Act.

### 1. Core Rule of Classification
* **Intra-State Supply**: When **Supplier Location** and **Place of Supply** are in the **SAME State/UT** → Charge **CGST + SGST** (equal 50/50 split).
* **Inter-State Supply**: When **Supplier Location** and **Place of Supply** are in **DIFFERENT States/UTs** → Charge **IGST**.

### 2. Place of Supply for Goods (Section 10 IGST Act)
* **Where movement involves goods**: The location of goods at the time movement terminates for delivery to the recipient.
* **Bill-to / Ship-to Model (Section 10(1)(b))**: Deemed to be the principal place of business of the third party ordering the shipment.
* **No movement involved**: Location of goods at the time of delivery to the recipient.

### 3. Place of Supply for Services (Section 12 IGST Act)
* **B2B General Rule**: Location of the registered recipient.
* **B2C General Rule**: Location of recipient if address is on record; otherwise, location of the supplier.
* **Immovable Property (Rent, Architect, Hotel)**: Location where the immovable property is situated.`
  },

  // 5. INVOICING RULES & MANDATORY FIELDS (RULE 46)
  {
    id: "invoicing-rules",
    topics: ["invoice rules", "mandatory invoice fields", "rule 46", "tax invoice", "credit note", "debit note", "delivery challan"],
    title: "GST Tax Invoicing Statutory Requirements (Rule 46)",
    content: `Under **Rule 46 of the CGST Rules, 2017**, a tax invoice issued by a registered supplier must contain specific statutory particulars.

### 1. Mandatory Fields on a GST Tax Invoice
1. Name, address, and **15-digit GSTIN** of the supplier.
2. Consecutive **Invoice Number** (not exceeding 16 characters, containing alphabets, numerals, and special characters '/' or '-').
3. Date of issuance.
4. Name, address, and GSTIN/UIN of the recipient (if registered).
5. For unregistered recipient (B2C) where invoice value is **≥ ₹50,000**: Name, address, and state/Place of Supply.
6. **HSN code of goods** or **SAC code of services**.
7. Description of goods or services.
8. Quantity and Unit of Measurement (UOM/UQC).
9. Total value of supply and taxable value after discount.
10. Tax rate applicable (CGST, SGST, IGST, Cess).
11. Amount of tax charged split under respective heads.
12. Place of Supply along with state name and state code.
13. Address of delivery where different from Place of Supply.
14. Whether tax is payable on **Reverse Charge** basis (Yes/No).
15. Signature or digital signature of the supplier or authorized representative.

### 2. Credit Notes (Section 34(1)) and Debit Notes (Section 34(3))
* **Credit Note**: Issued when taxable value or tax charged in invoice exceeds actual value, or goods returned, or deficiency in service.
* **Debit Note**: Issued when taxable value or tax charged in original invoice is lower than actual value.`
  },

  // 6. E-INVOICING (ELECTRONIC INVOICING)
  {
    id: "e-invoicing",
    topics: ["e-invoicing", "einvoicing", "irn", "qr code", "e invoice threshold", "irp", "einvoice limit"],
    title: "e-Invoicing Rules & Mandatory Thresholds",
    content: `**e-Invoicing (Electronic Invoicing)** is a statutory standard under Rule 48(4) where B2B invoices are validated electronically by the Government's Invoice Registration Portal (IRP).

### 1. Current Mandatory Threshold
* **Turnover Threshold**: Mandatory for all registered businesses whose aggregate annual turnover exceeded **₹5 Crores** in any preceding financial year since FY 2017-18.

### 2. Applicable Transactions
* **B2B Invoices** (Business to Business).
* **Exports** (with or without payment of IGST).
* **Supplies to SEZ units / developers**.
* **Credit Notes & Debit Notes** linked to B2B supplies.
*(Note: B2C invoices do not require IRN, but entities above ₹500 Cr must include Dynamic QR codes for UPI payments).*

### 3. Core Technical Outputs
* **IRN (Invoice Reference Number)**: A unique 64-character hash generated by the IRP using SHA-256 algorithm.
* **Signed QR Code**: Generated by IRP containing GSTIN of supplier, recipient, invoice date, number, value, HSN, and IRN. Invoices without IRP QR code are legally invalid.`
  },

  // 7. E-WAY BILL RULES (RULE 138)
  {
    id: "e-way-bill",
    topics: ["eway bill", "e-way bill", "rule 138", "consignment value", "50000 limit", "part a part b", "validity of eway bill"],
    title: "e-Way Bill Regulations & Validity (Rule 138)",
    content: `An **e-Way Bill (Electronic Way Bill)** is an electronic document generated on the e-Way Bill portal for the movement of goods under Rule 138 of CGST Rules.

### 1. Mandatory Generation Threshold
* Generated when the **Consignment Value** of goods exceeds **₹50,000** for inter-state or intra-state movement.
* **Consignment Value** includes taxable value + GST charged, excluding exempt supplies.
* Mandatory **regardless of value** for:
  1. Inter-state movement of goods by principal to Job Worker.
  2. Inter-state transport of handicraft goods by exempt dealers.

### 2. Structure: Part A vs Part B
* **Part A**: GSTIN of supplier & recipient, Place of delivery, Invoice/Challan number, Value of goods, HSN code, Reason for transportation.
* **Part B**: Transporter document number (LR / RR / Airway Bill) and Vehicle registration number.

### 3. Validity Periods
* **Normal Cargo**: **1 Day** for every **200 km** (or part thereof).
* **Over Dimensional Cargo (ODC) / Multimodal involving ship**: **1 Day** for every **20 km**.`
  },

  // 8. INPUT TAX CREDIT (ITC) & BLOCKED CREDITS (SECTION 16 & 17)
  {
    id: "itc-rules",
    topics: ["itc", "input tax credit", "section 16", "section 17(5)", "blocked itc", "180 days rule", "gstr-2b matching", "rule 42", "rule 43"],
    title: "Input Tax Credit (ITC) Rules & Blocked Credits (Section 17(5))",
    content: `**Input Tax Credit (ITC)** allows registered taxpayers to offset GST paid on business purchases against output GST liability.

### 1. Four Pillars of ITC Eligibility (Section 16(2))
1. **Possession of Tax Invoice or Debit Note** issued by registered supplier.
2. **Actual Receipt of Goods or Services**.
3. **Tax paid to the Government**: Supplier must have reported the invoice in GSTR-1, and it must appear in recipient's **GSTR-2B**.
4. **Furnishing Return**: Recipient must file GSTR-3B.

### 2. The 180-Day Payment Rule (Proviso to Section 16(2))
* The recipient must pay the supplier the invoice value plus GST within **180 days** from the invoice date.
* If unpaid within 180 days, the ITC availed must be reversed in GSTR-3B along with interest @ 18% p.a. (re-claimable upon eventual payment).

### 3. Blocked Credits under Section 17(5) (Ineligible ITC)
No ITC can be claimed on:
* **Motor Vehicles** for passenger transport with seating capacity ≤ 13 persons (unless used for vehicle sales, passenger transport, or driving school).
* **Food, beverages, outdoor catering**, beauty treatment, health services, and life/health insurance (unless mandatory by law or for outward taxable supply).
* **Membership of club**, health, and fitness center.
* **Works Contract services** for construction of an immovable property (except plant & machinery).
* **Goods lost, stolen, destroyed, written off**, or disposed of as free gifts/samples.
* Goods or services used for **personal consumption**.`
  },

  // 9. REVERSE CHARGE MECHANISM (RCM - SECTION 9(3) & 9(4))
  {
    id: "rcm-rules",
    topics: ["rcm", "reverse charge", "section 9(3)", "section 9(4)", "self invoice", "who pays rcm", "gta rcm", "advocate legal fee"],
    title: "Reverse Charge Mechanism (RCM - Section 9(3) & 9(4))",
    content: `Under the **Reverse Charge Mechanism (RCM)**, the liability to pay GST is shifted from the supplier to the **recipient** of goods or services.

### 1. Key Supplies Notified under Section 9(3)
1. **Goods Transport Agency (GTA)**: 5% RCM where GTA does not opt for forward charge @ 12%.
2. **Legal Services**: Provided by an individual advocate or senior advocate or firm of advocates to any business entity.
3. **Services by Arbitral Tribunal** to a business entity.
4. **Sponsorship Services** provided to any body corporate or partnership firm.
5. **Director Services**: Provided by a director to the company/body corporate.
6. **Insurance Agent & Recovery Agent** services to insurance companies/banking institutions.
7. **Import of Services** for business purposes from outside India.

### 2. Operational Rules for RCM
* **Mandatory Cash Payment**: RCM tax liability **cannot be settled using existing Input Tax Credit (ITC)**; it must be paid in cash via Electronic Cash Ledger.
* **ITC Claim**: Recipient can claim full ITC on the RCM tax paid in the same or subsequent month's GSTR-3B.
* **Self-Invoicing (Section 31(3)(f))**: When purchasing from an unregistered supplier under RCM, the recipient must issue a **Self-Invoice** and a **Payment Voucher**.`
  },

  // 10. GST RETURN FILING SCHEDULE & COMPLIANCE
  {
    id: "gst-returns",
    topics: ["returns", "gstr-1", "gstr-3b", "gstr-2b", "gstr-9", "return dates", "deadlines", "qrmp scheme", "late fee", "interest"],
    title: "GST Return Filing Hierarchy & Due Dates",
    content: `Registered taxpayers must file periodic returns detailing outward supplies, input tax credits, and net tax payable.

### 1. Core Return Calendar
| Return | Purpose | Due Date |
|---|---|---|
| **GSTR-1** | Outward supplies (Sales) | **11th** of subsequent month (Monthly) / **13th** (Quarterly QRMP) |
| **GSTR-2B** | Auto-drafted static ITC ledger | Generated automatically on **14th** of subsequent month |
| **GSTR-3B** | Summary return & Net tax settlement | **20th** of subsequent month (Staggered 22nd/24th for QRMP) |
| **CMP-08** | Composition quarterly tax statement | **18th** after quarter end |
| **GSTR-4** | Annual return for Composition dealers | **30th April** following financial year |
| **GSTR-9** | Annual Return for Regular taxpayers | **31st December** following financial year |
| **GSTR-9C** | Self-certified reconciliation (> ₹5 Cr) | **31st December** along with GSTR-9 |

### 2. QRMP Scheme (Quarterly Return Monthly Payment)
Taxpayers with turnover up to **₹5 Crores** can opt to file GSTR-1 and GSTR-3B quarterly while paying tax monthly using Challan PMT-06 (via 35% Fixed Sum or Self-Assessment method).`
  },

  // 11. HSN & SAC CLASSIFICATION
  {
    id: "hsn-sac-rules",
    topics: ["hsn", "sac", "hsn code", "sac code", "classification", "chapter 84", "chapter 99", "how many digits"],
    title: "HSN & SAC Code Classification Guidelines",
    content: `**HSN (Harmonized System of Nomenclature)** classifies goods globally, while **SAC (Services Accounting Code)** classifies services under Chapter 99.

### 1. Mandatory HSN Digit Requirements
* **Turnover up to ₹5 Crores**: Mandatory **4-digit HSN** on all B2B tax invoices (optional for B2C).
* **Turnover exceeding ₹5 Crores**: Mandatory **6-digit HSN** on **all** B2B and B2C tax invoices.
* **Chemicals, Export/Import**: Mandatory **8-digit HSN** codes.

### 2. Hierarchy Example (e.g., Computer Laptop: 8471 30 10)
* **Chapter (First 2 digits - 84)**: Nuclear reactors, boilers, machinery and mechanical appliances.
* **Heading (First 4 digits - 8471)**: Automatic data processing machines and units thereof.
* **Sub-heading (First 6 digits - 8471 30)**: Portable automatic data processing machines (< 10 kg).
* **Tariff Item (8 digits - 8471 30 10)**: Personal computer / Laptop.`
  },

  // 12. INTEREST, PENALTIES, AND LATE FEES
  {
    id: "penalties-interest",
    topics: ["penalty", "late fee", "interest rate", "section 50", "section 122", "delay fee", "wrong itc penalty"],
    title: "Statutory Interest, Late Fees & Penalties under GST",
    content: `Non-compliance, late filing, or unpaid GST attracts statutory interest and late fees.

### 1. Interest under Section 50
* **Delayed Tax Payment**: **18% per annum** calculated on net cash liability (from the day following due date until payment date).
* **Wrongly Availed & Utilized ITC**: **24% per annum** under Section 50(3).

### 2. Late Fees under Section 47
* **Regular Returns (GSTR-1, GSTR-3B)**:
  * **Nil Returns**: ₹20 per day (₹10 CGST + ₹10 SGST), maximum capped at ₹500.
  * **Tax Liability Returns**: ₹50 per day (₹25 CGST + ₹25 SGST), maximum capped based on turnover:
    * Turnover up to ₹1.5 Cr: Capped at **₹2,000**.
    * Turnover ₹1.5 Cr to ₹5 Cr: Capped at **₹5,000**.
    * Turnover > ₹5 Cr: Capped at **₹10,000**.

### 3. General Penalties (Section 122)
* Issuing invoice without supply, collecting tax but not paying within 3 months: **100% of tax evaded or ₹10,000**, whichever is greater.`
  },

  // 13. GSTSAHAYAK 10 STATUTORY PRE-VALIDATION RULES
  {
    id: "gst-sahayak-rules",
    topics: ["rules", "10 rules", "pre-validation rules", "validation rules", "how sahayak validates", "statutory rules engine"],
    title: "GSTSAHAYAK 10 Deterministic Pre-Validation Rules",
    content: `GSTSAHAYAK enforces 10 statutory validation rules on every draft invoice before submission:

1. **Rule 1: GSTIN Structure & Checksum**: Validates 15-character alphanumeric format and verifies ISO 7064 Mod 11,10 check character.
2. **Rule 2: State Code Alignment**: Ensures first 2 digits of supplier and recipient GSTINs match respective state master registers.
3. **Rule 3: Tax Split Classification**: Enforces strict Intra-State (equal CGST + SGST) vs Inter-State (IGST) selection based on supplier state and Place of Supply.
4. **Rule 4: HSN/SAC Statutory Rate Match**: Cross-references product item tax rates against CBIC master schedules.
5. **Rule 5: Precision Arithmetic Split**: Validates 4-way financial splits (Taxable × Rate = Exact CGST + SGST or IGST) without rounding drift.
6. **Rule 6: Mandatory Fields Inspection**: Ensures compliance with Rule 46 (Invoice Number, Date, Customer details, HSN, Tax breakups).
7. **Rule 7: Duplicate Invoice Detection**: Checks sequential number uniqueness within the active financial year.
8. **Rule 8: e-Way Bill Threshold Guard**: Triggers alert when taxable consignment value exceeds ₹50,000.
9. **Rule 9: Non-Negative & Zero Sanity Check**: Rejects negative line quantities or zero-rate discrepancies.
10. **Rule 10: Reverse Charge Flagging**: Flags RCM liabilities when supplier supplies notified GTA, legal, or director services.`
  },

  // 14. EXPLAINABLE AI ANOMALY DETECTION ENGINE
  {
    id: "ai-anomaly-engine",
    topics: ["anomaly detection", "isolation forest", "shap", "machine learning", "outlier", "risk score", "how ai works in gst"],
    title: "Explainable AI Anomaly Detection & Radar in GSTSAHAYAK",
    content: `GSTSAHAYAK pairs deterministic rule validation with an **Unsupervised Isolation Forest Machine Learning Engine** developed in Scikit-Learn.

### 1. Algorithmic Mechanics
* **100 Isolation Trees**: Partitions multi-dimensional feature space to isolate suspicious anomalies with minimal tree depth.
* **Telemetry Features Evaluated**:
  1. *Unit Price Z-Score Deviation*: Flags unit rates departing > 2.5σ from product catalog historical medians.
  2. *Total Transaction Volume Surge*: Detects unusual high-ticket single invoices compared to customer historical averages.
  3. *Uncharacteristic Discount Ratio*: Highlights discounts exceeding peer benchmarks.
  4. *Inter-State Volumetric Anomalies*: Detects abnormal cross-border volume spikes.

### 2. SHAP-Style Explainability
Rather than presenting a black-box decision, GSTSAHAYAK breaks down exactly which features contributed to the anomaly risk score with natural language recommendations.`
  },

  // 15. CLEARTAX INCOME TAX & ITR SUITE (INTEGRATION)
  {
    id: "cleartax-itr-hub",
    topics: ["income tax", "itr", "cleartax", "old vs new regime", "section 115bac", "80c", "80d", "hra", "form 16", "ay 2026-27"],
    title: "ClearTax Income Tax & ITR Filing Suite (AY 2026-27 / FY 2025-26)",
    content: `GSTSAHAYAK includes an integrated **ClearTax Income Tax Hub** for FY 2025-26 (AY 2026-27).

### 1. New Tax Regime (Section 115BAC - Budget 2024/2025/2026)
* **Standard Deduction**: Increased to **₹75,000** for salaried taxpayers.
* **New Slabs**:
  * ₹0 - ₹3,00,000: Nil (0%)
  * ₹3,00,001 - ₹7,00,000: 5%
  * ₹7,00,001 - ₹10,00,000: 10%
  * ₹10,00,001 - ₹12,00,000: 15%
  * ₹12,00,001 - ₹15,00,000: 20%
  * Above ₹15,00,000: 30%
* **Section 87A Rebate**: **Zero Tax** for net taxable income up to **₹7,00,000**.

### 2. Old Tax Regime
* Allows Chapter VI-A deductions: **Section 80C** (up to ₹1.5L), **80D** Health Insurance, **80CCD(1B)** NPS (up to ₹50k), **Section 24(b)** Home loan interest (up to ₹2L), and **HRA exemption** u/s 10(13A).

### 3. Integrated Tools
* **Form 16 Auto-Fill Parser**: 1-click parsing of corporate salary and TDS slips.
* **AIS/TIS & 26AS Tax Credit Viewer**: Reconciles dividend, salary TDS, and security sales.
* **Instant ITR-V Acknowledgment**: Generates official CBDT ITR-V acknowledgement slip.`
  }
];

/**
 * Searches the knowledge base and synthesizes comprehensive answers
 * for any GST or taxation question.
 * @param {string} rawQuery User prompt
 * @returns {string|null} Markdown-formatted comprehensive answer or null if unrelated
 */
export function searchGstKnowledge(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") return null;
  const q = rawQuery.toLowerCase().trim();

  // Score each entry
  const scored = GST_KNOWLEDGE_BASE.map(entry => {
    let score = 0;
    for (const topic of entry.topics) {
      if (q.includes(topic)) {
        score += topic.length * 3;
      } else {
        const words = topic.split(" ");
        const matchedWords = words.filter(w => w.length > 2 && q.includes(w));
        score += matchedWords.length * 1.5;
      }
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best && best.score >= 3) {
    // If multiple topics scored high, synthesize related highlights
    const topScorers = scored.filter(s => s.score >= 5).slice(0, 2);
    if (topScorers.length === 2 && topScorers[1].entry.id !== topScorers[0].entry.id) {
      return `${topScorers[0].entry.content}\n\n---\n\n### Related Reference: ${topScorers[1].entry.title}\n${topScorers[1].entry.content}`;
    }
    return best.entry.content;
  }

  // Fallback broad GST inquiry
  if (q.includes("gst") || q.includes("tax") || q.includes("invoice") || q.includes("rule") || q.includes("return")) {
    return `### GST Comprehensive Function Guide
I have access to the complete statutory repository for Goods and Services Tax (GST) in India. Here are key functional areas I can assist you with:

1. **GST Architecture**: Intra-State (CGST + SGST) vs Inter-State (IGST) determination and rate splits.
2. **Registration Thresholds**: Section 22 (₹40L/₹20L) and Section 24 mandatory triggers.
3. **Invoicing Rules (Rule 46)**: 16 mandatory fields, Credit/Debit notes, and sequential numbering.
4. **e-Invoicing**: ₹5 Crore mandatory threshold, IRP, and QR code guidelines.
5. **e-Way Bills (Rule 138)**: ₹50,000 threshold, Part A/B, and distance validity.
6. **Input Tax Credit (ITC)**: Section 16 eligibility, Section 17(5) blocked credits, and 180-day rule.
7. **Reverse Charge Mechanism (RCM)**: Section 9(3) and 9(4) applicable services, self-invoicing.
8. **Return Filing**: GSTR-1, GSTR-2B, GSTR-3B, QRMP scheme, GSTR-9 annual return, interest & late fees.
9. **HSN & SAC Codes**: 4-digit vs 6-digit classification under CBIC 2026 master schedules.
10. **GSTSAHAYAK 10 Pre-Validation Rules**: Pre-submission deterministic inspection and Isolation Forest ML radar.
11. **ClearTax Income Tax Suite**: FY 2025-26 (AY 2026-27) Old vs New Tax Regime optimization.

*Ask me about any specific rule, section, calculation, or compliance process!*`;
  }

  return null;
}
