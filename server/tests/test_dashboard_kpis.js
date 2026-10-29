import jwt from "jsonwebtoken";

const token = jwt.sign(
  { userId: "cmvrp2x0f0000vzc4nrcpe4wd", email: "ZEESUNNY2145@GMAIL.COM" },
  "gst_sahayak_secret_key_2026"
);

async function check() {
  const res = await fetch("http://localhost:5000/api/dashboard", {
    headers: { Authorization: "Bearer " + token }
  });
  const data = await res.json();
  console.log("=== Dashboard Response for ZEESUNNY2145@GMAIL.COM ===");
  console.log("KPIs:", data.kpis);
  console.log("Recent Invoices:", data.recentInvoices?.slice(0, 3));
  console.log("Monthly Trends:", data.monthlyTrends);
}

check().catch(console.error);

