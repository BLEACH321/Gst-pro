# GST SAHAYAK — AI Anomaly Detection & Explainable AI (XAI) Model Documentation

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Module:** Machine Learning & Feature Attribution Subsystem (`ai_engine/anomaly_detector.py`)  
**Algorithm:** Isolation Forest (Scikit-Learn) with Baseline Perturbation Attribution  

---

## 1. Machine Learning Problem Statement

In commercial taxation, identifying risky transactions before filing presents distinct challenges:
1. **Severe Class Imbalance:** Over 99% of transactions are legitimate; fraudulent or erroneous invoices represent a minute fraction.
2. **Confidentiality:** Real audited tax fraud records cannot be publicly distributed or used in college projects due to privacy and tax secrecy laws.
3. **Evolving Evasion Tactics:** Fraudsters constantly alter invoice amounts and split bills. Supervised models trained on past fraud patterns quickly overfit or become obsolete.

### Why Isolation Forest?
The **Isolation Forest** (Liu, Ting, and Zhou, 2008) is an unsupervised ensemble learning algorithm specifically designed for anomaly detection. 

**Mathematical Intuition:**
- Rather than modeling normal data points (like Gaussian Mixture Models or One-Class SVMs), Isolation Forest isolates anomalies.
- In a random binary search tree (iTree), anomalies require **fewer random recursive feature splits** to be isolated into leaf nodes because they are sparse and distant from the dense cluster of normal transactions.
- The **average path length $h(x)$** across $N$ trees measures normality. Short path length = high anomaly probability.

```
       [Normal Dense Cluster]                      [Anomaly / Outlier]
         O   O O  O   O                                     ★
        O  O  O O   O                                 (Isolated in 2 splits!)
         O   O  O  O
   (Requires 10+ splits to isolate)
```

---

## 2. Feature Engineering Pipeline

The model extracts 13 continuous and discrete numerical features from each commercial invoice:

| Feature Name | Type | Domain Rationale & Purpose |
|---|---|---|
| `invoice_amount` | Continuous (₹) | Total payable value; detects sudden high-ticket invoices. |
| `taxable_amount` | Continuous (₹) | Base assessable commercial value before tax. |
| `gst_amount` | Continuous (₹) | Total GST assessed (CGST + SGST + IGST). |
| `gst_rate_avg` | Float (%) | Effective weighted average tax rate across all line items. |
| `quantity_total` | Integer | Total units billed; flags abnormal retail batch volume. |
| `discount_rate` | Float (%) | Promotional discount percentage; flags disguised profit extraction. |
| `item_count` | Integer | Number of line items; distinguishes split bills from bulk orders. |
| `unit_price_avg` | Continuous (₹) | Mean price per unit; catches under-invoicing and circular trading. |
| `unit_price_max` | Continuous (₹) | Peak unit price in the invoice. |
| `deviation_from_customer_avg` | Float (%) | Percentage variance from customer's historical average ticket size. |
| `deviation_from_category_avg` | Float (%) | Percentage variance from product category baseline price. |
| `inter_state_flag` | Binary (0 / 1) | Geographic flag indicating whether IGST was assessed. |
| `frequency_score` | Float | Invoice velocity score for the recipient party in recent periods. |

---

## 3. Synthetic Training Dataset Generation

To ensure reproducible, ethical, and realistic machine learning evaluation without violating corporate privacy, a synthetic dataset generator (`generate_synthetic_history`) produces realistic transactional records:

1. **Normal Business Operations (85%):**
   Realistic commercial profiles across 5 sectors:
   - **Electronics & IT Hardware:** ₹15,000 to ₹65,000 unit prices, 18% GST.
   - **IT Hardware Workstations:** ₹25,000 to ₹95,000 unit prices, 18% GST.
   - **Office Supplies:** ₹200 to ₹3,500 unit prices, 12% GST.
   - **Professional Consulting:** ₹20,000 to ₹120,000 service fees, 18% GST.
   - **Commercial Appliances:** ₹5,000 to ₹45,000 unit prices, 28% GST.
   - Controlled Gaussian variance: $\mathcal{N}(0, 15\%)$ on customer deviation.
2. **Anomalous Patterns (15%):**
   - **Surge Amount Outliers:** Ticket size 400%+ above historical baseline with high quantities.
   - **Excessive Quantities:** Thousands of units billed to individual non-wholesale entities.
   - **Deep Discount Anomalies:** Discounts exceeding 35% on catalog merchandise without promotional authorization.
   - **High-Bracket Classification Outliers:** Unusual 28% luxury slabs applied to standard commercial commodities.

---

## 4. Explainable AI (XAI): Baseline Perturbation Attributions

In tax compliance, an unexplained risk score (e.g. *"Risk: 82%"*) is useless to a Chartered Accountant. The user must know **which exact factor** triggered the alert.

### Perturbation Attribution Methodology:
1. Calculate the base anomaly score: $S_{\text{base}} = -\text{score\_samples}(x)$
2. For each feature $i \in \{1, \dots, 13\}$:
   - Construct a perturbed vector $x^{(i)}$ where feature $i$ is replaced by the historical dataset mean $\mu_i$.
   - Recompute the perturbed score: $S_{\text{pert}} = -\text{score\_samples}(x^{(i)})$
   - The raw delta $\Delta_i = \max(0, S_{\text{base}} - S_{\text{pert}})$ represents how much of the anomaly score is removed when feature $i$ is returned to normal.
   - Apply a Z-score weight: $w_i = \Delta_i \times (1 + 0.3 \times \min(Z_i, 5.0))$
3. Normalize all weights so they sum to 100%:
   $$\text{Attribution}_i = \frac{w_i}{\sum_{j=1}^{13} w_j} \times 100\%$$

This produces transparent feature weights such as:
- **Total Invoice Amount:** 42.5%
- **Customer Historical Deviation:** 28.3%
- **Total Item Quantity:** 18.2%
- **Discount Percentage:** 11.0%

---

## 5. Model Risk Scale Normalization

The raw Isolation Forest score $s \in [-0.7, -0.3]$ is mapped to an intuitive **0 to 100% Risk Index**:
$$\text{Normalized Risk} = \text{clip}\left(\frac{-s - 0.42}{0.25} \times 100, 0, 100\right)$$

- **`0% - 39%` → `VALID` (Compliant / Normal Baseline):** Low risk; transaction aligns with commercial norms.
- **`40% - 64%` → `WARNING` (Review Recommended):** Mild deviation in price or volume; requires casual verification.
- **`65% - 100%` → `POTENTIAL_RISK` (Flagged Outlier):** Severe multivariate deviation; requires dual authorization and purchase order verification.

---

## 6. Critical Project Limitations (Viva Preparation)

1. **Outliers $\neq$ Legal Fraud:** An invoice for ₹10,000,000 may be completely legal if a genuine large contract was signed. The AI model flags statistical anomalies for human review, not definitive legal guilt.
2. **Decision Support, Not Replacement:** The model assists tax professionals before filing; it does not replace the official GST Network (GSTN) or statutory audits.
3. **Synthetic Training Data Scope:** The baseline is trained on realistic synthetic SME distributions. Deploying in an enterprise requires re-fitting on that business's actual 12-month transaction ledger.

