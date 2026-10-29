# GST SAHAYAK — Project Changelog

All notable changes to the **GST Sahayak** codebase, architecture, rules engine, and AI pipelines are documented in this file.

---

## [1.0.0-PRO] - 2026-10-29

### Added
- **Foundational Project Documentation Suite (12 Master Documents):**
  - `PROJECT_AUDIT.md`: Complete audit of frontend, backend, rules, AI model, and live deployment.
  - `IMPLEMENTATION_PLAN.md`: 10-phase engineering roadmap for zero-regression implementation.
  - `TESTING_STRATEGY.md`: Multilayer testing methodology covering static checks, unit tests, ML evaluation, and multi-tenant isolation.
  - `TEST_CASES.md`: Detailed test case specifications for TEST-001 through TEST-040.
  - `PROJECT_ARCHITECTURE.md`: High-level architecture, hybrid triad design, and Mermaid workflows.
  - `GST_RULE_ENGINE_DOCUMENTATION.md`: Full legal reference and implementation guide for RULE-GST-001 to RULE-GST-010.
  - `AI_MODEL_DOCUMENTATION.md`: Isolation Forest theory, perturbation attributions, 13 multivariate features, and normalization formulas.
  - `DATABASE_DOCUMENTATION.md`: ER diagram, table schemas, data dictionary, and multi-tenant isolation constraints.
  - `DEPLOYMENT_GUIDE.md`: Local startup commands, cloud deployment guide, and diagnosis of live Vercel configuration.
  - `USER_GUIDE.md`: End-to-end user manual and walkthrough for creating pre-validated invoices.
  - `PROJECT_LIMITATIONS.md`: Statutory, legal, and algorithmic boundaries for academic defense.
  - `CHANGELOG.md`: Chronological log of system enhancements.
- **Discovered Authoritative Classification Assets:**
  - Identified `HSN_SAC.xlsx` in repository root containing 21,935 official CBIC HSN codes and 681 SAC codes.

### Identified Critical Issues for Immediate Resolution
- **Security:**
  - Auth middleware auto-login bypass (`server/src/middleware/auth.js`).
  - Hardcoded backdoor credentials (`demo1234`, `admin123`) in `server/src/routes/auth.js`.
  - Empty credential shortcut granting token for first database user.
  - Cross-tenant update and delete permissions on products and customer records.
  - Audit log data leakage across tenants.
- **AI / ML Pipeline:**
  - Scikit-learn `UserWarning: X does not have valid feature names` emitted to stdout, breaking `JSON.parse` in `aiService.js` and causing silent fallback to JS heuristics.
- **AI Workspace Agent:**
  - `agent.js` calling undeclared functions (`runRuleValidation`, `runAnomalyDetectionOnInvoice`) and referencing non-existent properties (`user.businessId`).
- **Live Deployment:**
  - Vercel frontend bundle calling `http://localhost:5000/api` due to missing `VITE_API_URL` environment variable at build time.

---

## [0.9.0-BETA] - Initial Deployed Prototype

### Added
- Initial React 19 frontend layout with cyber-dock sidebar, navigation, and Recharts dashboards.
- Basic Express.js server with Prisma SQLite backend.
- Initial implementation of 10 deterministic GST rules in `gstRuleEngine.js`.
- Basic Python Isolation Forest script in `anomaly_detector.py`.
- Static 16-item HSN sample catalog in `hsnService.js`.
- Standalone Income Tax (ITR) calculation portal.
- Deployed frontend to Vercel at `https://gst-pro-mu.vercel.app/`.

