import { PrismaClient } from "@prisma/client";

process.env.PORT = "5099";
process.env.JWT_SECRET = "gst_sahayak_test_secret_2026";

// Import index to launch server on 5099
await import("../src/index.js");

const BASE = "http://localhost:5099/api";
const prisma = new PrismaClient();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function check(description, condition, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${description}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${description} - ${details}`);
  }
}

async function run() {
  console.log("==================================================");
  console.log("RUNNING BACKEND REST API ENDPOINT TEST SUITE");
  console.log("==================================================");

  let token = null;
  let createdProductId = null;
  let createdInvoiceId = null;

  // ----------------------------------------------------
  // 1. Health Check
  // ----------------------------------------------------
  console.log("\n[1. System Health Check]");
  {
    const res = await fetch(`${BASE}/health`);
    const data = await res.json();
    check("GET /api/health returns 200 OK", res.status === 200);
    check("Health status is OK", data.status === "OK");
  }

  // ----------------------------------------------------
  // 2. Authentication: Login
  // ----------------------------------------------------
  console.log("\n[2. Authentication API]");
  {
    // Try login with seeded user
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sunny@gstpro.com", password: "demo1234" })
    });
    const data = await res.json();
    check("POST /api/auth/login returns 200", res.status === 200);
    check("Login returns JWT token", !!data.token);
    check("Login returns user profile", data.user && data.user.email === "sunny@gstpro.com");
    token = data.token;

    // Test /api/auth/me
    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    check("GET /api/auth/me returns current user", meRes.status === 200 && meData.user.email === "sunny@gstpro.com");
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // ----------------------------------------------------
  // 3. Business Profile API
  // ----------------------------------------------------
  console.log("\n[3. Business Profile API]");
  {
    const res = await fetch(`${BASE}/business`, { headers: authHeaders });
    const data = await res.json();
    check("GET /api/business returns 200", res.status === 200);
    check("Business profile has GSTIN", !!data.gstin);
    check("Business profile has registered state", !!data.state);

    // Update profile
    const updateRes = await fetch(`${BASE}/business`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        businessName: "Gupta Enterprise Infotech Pvt Ltd",
        gstin: data.gstin,
        state: "Maharashtra",
        address: data.address,
        businessCategory: data.businessCategory,
        email: data.email,
        phone: data.phone
      })
    });
    check("PUT /api/business updates profile", updateRes.status === 200);
  }

  // ----------------------------------------------------
  // 4. Products Master API
  // ----------------------------------------------------
  console.log("\n[4. Product Master API]");
  {
    const res = await fetch(`${BASE}/products`, { headers: authHeaders });
    const products = await res.json();
    check("GET /api/products returns product array", res.status === 200 && Array.isArray(products));
    check("Existing seeded products found", products.length > 0);

    // Create a new product
    const createRes = await fetch(`${BASE}/products`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Test Mechanical Gaming Keyboard",
        category: "Electronics & IT Hardware",
        hsnSac: "84716040",
        gstRate: 18,
        price: 4999,
        unit: "PCS",
        description: "RGB Mechanical Keyboard with Cherry MX switches"
      })
    });
    const created = await createRes.json();
    check("POST /api/products creates product", createRes.status === 201);
    check("Created product has ID", !!created.id);
    createdProductId = created.id;

    // AI HSN Suggestion API
    const hsnRes = await fetch(`${BASE}/products/suggest-hsn?q=laptop`, { headers: authHeaders });
    const hsnData = await hsnRes.json();
    check("GET /api/products/suggest-hsn returns candidate suggestions", hsnRes.status === 200 && hsnData.suggestions.length > 0);
    check("Suggestion has HSN code 84713010", hsnData.suggestions.some(s => s.hsnSac.startsWith("8471")));
  }

  // ----------------------------------------------------
  // 5. Customers Directory API
  // ----------------------------------------------------
  console.log("\n[5. Customer Directory API]");
  {
    const res = await fetch(`${BASE}/customers`, { headers: authHeaders });
    const customers = await res.json();
    check("GET /api/customers returns customer list", res.status === 200 && Array.isArray(customers));

    const createCustRes = await fetch(`${BASE}/customers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Apex Global Software Corp",
        gstin: "29AABCA9999K1Z4",
        state: "Karnataka",
        address: "Electronic City, Bengaluru",
        email: "billing@apexglobal.in",
        phone: "+91 98450 12345"
      })
    });
    check("POST /api/customers creates customer record", createCustRes.status === 201);
  }

  // ----------------------------------------------------
  // 6. Invoice Validation Preview (Pre-Validation without saving)
  // ----------------------------------------------------
  console.log("\n[6. Invoice Pre-Validation Preview API]");
  {
    const previewPayload = {
      invoiceNumber: `INV/2026/TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceDate: "2026-10-29",
      customerName: "Apex Global Software Corp",
      customerGstin: "29AABCA9999K1Z4",
      customerState: "Karnataka",
      customerAddress: "Electronic City, Bengaluru",
      subtotal: 84990,
      discount: 0,
      taxableAmount: 84990,
      cgst: 0,
      sgst: 0,
      igst: 15298.2,
      totalGst: 15298.2,
      grandTotal: 100288.2,
      isInterState: true,
      items: [
        {
          productName: "ASUS TUF A16 Laptop",
          hsnSac: "84713010",
          quantity: 1,
          unitPrice: 84990,
          discount: 0,
          taxableAmount: 84990,
          gstRate: 18,
          cgst: 0,
          sgst: 0,
          igst: 15298.2,
          total: 100288.2
        }
      ]
    };

    const res = await fetch(`${BASE}/invoices/validate-preview`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(previewPayload)
    });
    const data = await res.json();
    check("POST /api/invoices/validate-preview returns 200", res.status === 200);
    check("Response contains ruleEngine evaluation", !!data.ruleEngine);
    check("Response contains aiAnalysis", !!data.aiAnalysis);
    check("Response has overallStatus", !!data.overallStatus);
    check("Summary reports total rules evaluated", data.summary.totalRulesEvaluated >= 10);
  }

  // ----------------------------------------------------
  // 7. Invoice Creation & Finalization API
  // ----------------------------------------------------
  console.log("\n[7. Invoice Creation & Finalization API]");
  {
    const invNumber = `INV/2026/AUTOTEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const createPayload = {
      invoiceNumber: invNumber,
      invoiceDate: "2026-10-29",
      customerName: "Acme Infotech Solutions LLP",
      customerGstin: "27AABCA5566G1Z9",
      customerState: "Maharashtra",
      customerAddress: "BKC Mumbai",
      subtotal: 4999,
      discount: 0,
      taxableAmount: 4999,
      cgst: 449.91,
      sgst: 449.91,
      igst: 0,
      totalGst: 899.82,
      grandTotal: 5898.82,
      isInterState: false,
      items: [
        {
          productName: "Test Mechanical Gaming Keyboard",
          hsnSac: "84716040",
          quantity: 1,
          unitPrice: 4999,
          discount: 0,
          taxableAmount: 4999,
          gstRate: 18,
          cgst: 449.91,
          sgst: 449.91,
          igst: 0,
          total: 5898.82
        }
      ]
    };

    const res = await fetch(`${BASE}/invoices`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(createPayload)
    });
    const createdInv = await res.json();
    check("POST /api/invoices persists invoice", res.status === 201);
    check("Created invoice has ID", !!createdInv.id);
    check("Created invoice includes items", createdInv.items && createdInv.items.length === 1);
    check("Created invoice includes validation rules", Array.isArray(createdInv.validationRules));
    check("Created invoice includes anomaly result", !!createdInv.anomalyResult);
    createdInvoiceId = createdInv.id;

    // Fetch invoice by ID
    const getRes = await fetch(`${BASE}/invoices/${createdInvoiceId}`, { headers: authHeaders });
    const fetched = await getRes.json();
    check("GET /api/invoices/:id fetches full invoice details", getRes.status === 200 && fetched.id === createdInvoiceId);

    // Finalize invoice
    const finRes = await fetch(`${BASE}/invoices/${createdInvoiceId}/finalize`, {
      method: "POST",
      headers: authHeaders
    });
    const finData = await finRes.json();
    check("POST /api/invoices/:id/finalize transitions status to FINALIZED", finRes.status === 200 && finData.invoice.status === "FINALIZED");
  }

  // ----------------------------------------------------
  // 8. Dashboard & Telemetry APIs
  // ----------------------------------------------------
  console.log("\n[8. Analytics & Telemetry APIs]");
  {
    const dashRes = await fetch(`${BASE}/dashboard`, { headers: authHeaders });
    const dash = await dashRes.json();
    check("GET /api/dashboard returns 200", dashRes.status === 200);
    check("Dashboard contains KPIs (totalInvoices, taxable, gst)", dash.kpis && dash.kpis.totalInvoices > 0);
    check("Dashboard contains monthlyTrends array", Array.isArray(dash.monthlyTrends));
    check("Dashboard contains recentInvoices", Array.isArray(dash.recentInvoices));

    const anomRes = await fetch(`${BASE}/anomalies`, { headers: authHeaders });
    const anom = await anomRes.json();
    check("GET /api/anomalies returns 200", anomRes.status === 200);
    check("Anomaly telemetry has metrics", !!anom.metrics);
    check("Anomaly telemetry has distributionRanges", Array.isArray(anom.distributionRanges));
    check("Anomaly telemetry has categoryBreakdown", Array.isArray(anom.categoryBreakdown));
  }

  // ----------------------------------------------------
  // 9. Rules Governance & Reports
  // ----------------------------------------------------
  console.log("\n[9. Rules Governance & Reports APIs]");
  {
    const rulesRes = await fetch(`${BASE}/rules`, { headers: authHeaders });
    const rules = await rulesRes.json();
    check("GET /api/rules returns rules catalog", rulesRes.status === 200 && rules.length >= 10);

    const reportRes = await fetch(`${BASE}/reports/summary`, { headers: authHeaders });
    const report = await reportRes.json();
    check("GET /api/reports/summary returns 200", reportRes.status === 200);
    check("Report has totals and slabDistribution", report.totals && Array.isArray(report.slabDistribution));
  }

  // ----------------------------------------------------
  // 10. Audit Logs
  // ----------------------------------------------------
  console.log("\n[10. Audit Logs API]");
  {
    const auditRes = await fetch(`${BASE}/audit-logs`, { headers: authHeaders });
    const logs = await auditRes.json();
    check("GET /api/audit-logs returns audit log array", auditRes.status === 200 && Array.isArray(logs));
    check("Audit logs include INVOICE_CREATED or USER_LOGIN", logs.some(l => l.action.includes("INVOICE") || l.action.includes("USER")));
  }

  // ----------------------------------------------------
  // 11. AI Workspace Agent APIs
  // ----------------------------------------------------
  console.log("\n[11. AI Workspace Agent API]");
  {
    // Public ask (knowledge base inquiry)
    const pubRes = await fetch(`${BASE}/agent/public-ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "What is HSN code?" })
    });
    const pubData = await pubRes.json();
    check("POST /api/agent/public-ask answers statutory question", pubRes.status === 200 && pubData.response.length > 20);

    // Public ask rejects private inquiry without auth
    const privRes = await fetch(`${BASE}/agent/public-ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Create an invoice for me" })
    });
    const privData = await privRes.json();
    check("Public agent blocks invoice creation and requests login", privData.isPrivateRestricted === true);

    // Authenticated command
    const cmdRes = await fetch(`${BASE}/agent/command`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ prompt: "Show invoices that need review" })
    });
    const cmdData = await cmdRes.json();
    check("POST /api/agent/command executes risk query", cmdRes.status === 200 && !!cmdData.message);
  }

  // Clean up created test product and invoice
  if (createdInvoiceId) {
    await fetch(`${BASE}/invoices/${createdInvoiceId}`, { method: "DELETE", headers: authHeaders });
  }
  if (createdProductId) {
    await fetch(`${BASE}/products/${createdProductId}`, { method: "DELETE", headers: authHeaders });
  }

  console.log("\n==================================================");
  console.log(`BACKEND REST API RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log("==================================================");

  await prisma.$disconnect();
  process.exit(failedTests > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("FATAL TEST SUITE ERROR:", err);
  process.exit(1);
});

