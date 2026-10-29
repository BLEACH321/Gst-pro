import { PrismaClient } from "@prisma/client";
import { validateGstRules } from "./rules/gstRuleEngine.js";
import { analyzeInvoiceWithAI } from "./services/aiService.js";

const prisma = new PrismaClient();

async function addRichDummyData() {
  console.log("================================================================================");
  console.log("GST SAHAYAK - SEEDING CURATED REALISTIC DUMMY DEMO DATASET");
  console.log("================================================================================\n");

  // 1. Locate primary user
  let user = await prisma.user.findFirst({
    where: { email: "sunny@gstpro.com" },
    include: { business: true }
  });

  if (!user) {
    user = await prisma.user.findFirst({ include: { business: true } });
  }

  if (!user) {
    console.error("No user found in database. Run npm run seed first.");
    process.exit(1);
  }

  console.log(`Targeting Primary User: ${user.name} (${user.email}, ID: ${user.id})`);
  console.log(`Business Profile: ${user.business?.businessName} (${user.business?.gstin})\n`);

  // 2. Extra Diverse Products covering all GST brackets (0%, 5%, 12%, 18%, 28%)
  const newProducts = [
    // 0% Nil-Rated / Exempt Category
    {
      name: "CBIC Statutory GST Handbook & Legal Commentary (Printed Book)",
      category: "Books & Educational Literature",
      hsnSac: "49011010",
      gstRate: 0.0,
      price: 1450.0,
      unit: "NOS",
      description: "Official published guide to Central & State GST provisions and tariff schedules. Exempt under Notification 02/2017."
    },
    {
      name: "Public Health & Statutory Occupational Medical Checkup Retainer",
      category: "Healthcare & Human Health",
      hsnSac: "999312",
      gstRate: 0.0,
      price: 35000.0,
      unit: "SRV",
      description: "Preventive occupational health monitoring services by clinical establishment. Exempt under GST services notification."
    },

    // 5% Concessional Rate Category
    {
      name: "Solar Photovoltaic Inverter & Renewable Energy Module (5KW)",
      category: "Renewable Energy Devices",
      hsnSac: "84191910",
      gstRate: 5.0,
      price: 68000.0,
      unit: "SET",
      description: "MNRE-certified solar power conditioning unit and grid-tied inverter system."
    },
    {
      name: "Inter-State Commercial Freight & Road Cargo Transport (GTA Services)",
      category: "Logistics & Transport Services",
      hsnSac: "996511",
      gstRate: 5.0,
      price: 24500.0,
      unit: "TRP",
      description: "Goods Transport Agency consignment freight with RCM/forward charge concession."
    },

    // 12% Standard Concessional Category
    {
      name: "Smart POS Android Biometric Billing Terminal (4G / WiFi)",
      category: "Electronics & POS Hardware",
      hsnSac: "84705010",
      gstRate: 12.0,
      price: 18500.0,
      unit: "NOS",
      description: "Handheld electronic cash register with thermal printer and dual SIM."
    },
    {
      name: "Automated Digital Blood Pressure & Multipara Patient Vital Monitor",
      category: "Medical & Diagnostic Devices",
      hsnSac: "90189019",
      gstRate: 12.0,
      price: 22000.0,
      unit: "PCS",
      description: "Clinical grade digital vital monitoring apparatus for healthcare clinics."
    },
    {
      name: "Thermal Paper Rolls Pack (80mm x 50m, Pack of 50 Rolls)",
      category: "Stationery & Consumables",
      hsnSac: "48119010",
      gstRate: 12.0,
      price: 2100.0,
      unit: "BOX",
      description: "BPA-free high sensitivity thermal paper rolls for POS printers."
    },

    // 18% Standard Category
    {
      name: "Cisco Catalyst 24-Port Gigabit Managed Network Switch",
      category: "Networking & Telecommunications",
      hsnSac: "85176290",
      gstRate: 18.0,
      price: 48500.0,
      unit: "NOS",
      description: "Enterprise Layer 2/3 rack-mountable Ethernet switch with PoE+ capability."
    },
    {
      name: "Logitech Rally Plus Ultra-HD 4K Video Conferencing System",
      category: "Audio Visual & Communication",
      hsnSac: "85258900",
      gstRate: 18.0,
      price: 195000.0,
      unit: "SET",
      description: "Modular high-resolution conference room video and beamforming microphone array."
    },
    {
      name: "Enterprise Cyber Security SOC Monitoring & Penetration Testing",
      category: "Information Technology",
      hsnSac: "998315",
      gstRate: 18.0,
      price: 180000.0,
      unit: "QTR",
      description: "24/7 Security Operations Center monitoring, vulnerability assessment, and compliance audit."
    },
    {
      name: "Apple iPad Pro 11-inch M4 (Wi-Fi, 256GB Space Black)",
      category: "Electronics & Computing",
      hsnSac: "84713090",
      gstRate: 18.0,
      price: 99900.0,
      unit: "PCS",
      description: "Ultra Retina XDR OLED display tablet for executive and design mobile tasks."
    },

    // 28% Luxury / High-Bracket Category
    {
      name: "Carrier Commercial Multi-Split VRF HVAC Outdoor Condenser (10 HP)",
      category: "Commercial HVAC Systems",
      hsnSac: "84158110",
      gstRate: 28.0,
      price: 285000.0,
      unit: "SET",
      description: "Variable Refrigerant Flow central commercial cooling condensing unit."
    },
    {
      name: "High-Capacity Industrial Heavy Duty Diesel Generator (25 KVA)",
      category: "Electrical Equipment",
      hsnSac: "85021100",
      gstRate: 28.0,
      price: 340000.0,
      unit: "NOS",
      description: "Silent canopy three-phase diesel generator for industrial backup power."
    }
  ];

  let addedProductsCount = 0;
  const createdProductEntities = [];

  for (const prod of newProducts) {
    const existing = await prisma.product.findFirst({
      where: { userId: user.id, name: prod.name }
    });
    if (!existing) {
      const created = await prisma.product.create({
        data: { ...prod, userId: user.id }
      });
      createdProductEntities.push(created);
      addedProductsCount++;
    } else {
      createdProductEntities.push(existing);
    }
  }
  console.log(`[PRODUCTS] Added ${addedProductsCount} new diverse products across 0%, 5%, 12%, 18%, 28% GST brackets.`);

  // 3. Extra Customers from different states across India
  const newCustomers = [
    {
      name: "Bharat Petroleum Logistics Hub",
      gstin: "27AABCB0001Z1Z0",
      state: "Maharashtra",
      address: "Refinery Gate 3, Mahul, Chembur, Mumbai - 400074"
    },
    {
      name: "Karnataka State Bio-IT Alliance LLP",
      gstin: "29AABCK4455L1Z4",
      state: "Karnataka",
      address: "Biotech Corridor, Helix Infotech Park, Bengaluru - 560100"
    },
    {
      name: "Gujarat Industrial Power Corporation Ltd",
      gstin: "24AAACG3333M1Z6",
      state: "Gujarat",
      address: "Vadodara Petrochemicals Complex, Vadodara - 391340"
    },
    {
      name: "Delhi Capital Tech & Cyber Solutions",
      gstin: "07AAACD9988P1Z5",
      state: "Delhi",
      address: "Barakhamba Road, Connaught Place, New Delhi - 110001"
    },
    {
      name: "Tamil Nadu Heavy Automotives Private Limited",
      gstin: "33AAACT7788Q1Z3",
      state: "Tamil Nadu",
      address: "SIPCOT Industrial Estate, Sriperumbudur, Chennai - 602105"
    },
    {
      name: "Telangana Cloud Grid Data Systems",
      gstin: "36AAACT1122C1Z7",
      state: "Telangana",
      address: "Hitec City, Madhapur, Hyderabad - 500081"
    },
    {
      name: "West Bengal Eastern Distributing Traders",
      gstin: "19AAACW5566R1Z9",
      state: "West Bengal",
      address: "Salt Lake Sector V, Electronic Complex, Kolkata - 700091"
    },
    {
      name: "Rajasthan Heritage Solar Parks LLP",
      gstin: "08AAACR8877S1Z2",
      state: "Rajasthan",
      address: "Bhadla Solar Industrial Zone, Jodhpur - 342001"
    },
    {
      name: "Local SME Trader (Unregistered B2C Retail)",
      gstin: null,
      state: "Maharashtra",
      address: "Shop 14, APMC Market Yard, Vashi, Navi Mumbai - 400703"
    }
  ];

  let addedCustomersCount = 0;
  const createdCustomerEntities = [];

  for (const cust of newCustomers) {
    const existing = await prisma.customer.findFirst({
      where: { userId: user.id, name: cust.name }
    });
    if (!existing) {
      const created = await prisma.customer.create({
        data: {
          ...cust,
          userId: user.id,
          email: `procurement@${cust.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 15)}.in`,
          phone: "+91 " + Math.floor(9000000000 + Math.random() * 999999999)
        }
      });
      createdCustomerEntities.push(created);
      addedCustomersCount++;
    } else {
      createdCustomerEntities.push(existing);
    }
  }
  console.log(`[CUSTOMERS] Added ${addedCustomersCount} new multi-state customer directories.\n`);

  // 4. Generate 25 Curated Demo Invoices
  console.log("Generating 25 curated demonstration invoices with realistic scenarios...");

  const existingInvoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    select: { id: true, invoiceNumber: true }
  });

  const invoiceTemplates = [
    // SCENARIO 1: Standard Compliant Intra-State B2B (IT Equipment)
    {
      numberSuffix: "201",
      customer: createdCustomerEntities.find(c => c.state === "Maharashtra"),
      product: createdProductEntities.find(p => p.name.includes("Cisco Catalyst")),
      qty: 2,
      discount: 2000,
      riskOverride: null, // Let engine evaluate naturally
      status: "FINALIZED",
      daysAgo: 2
    },
    // SCENARIO 2: Standard Compliant Inter-State B2B (Bengaluru Cloud)
    {
      numberSuffix: "202",
      customer: createdCustomerEntities.find(c => c.state === "Karnataka"),
      product: createdProductEntities.find(p => p.name.includes("iPad Pro")),
      qty: 3,
      discount: 4500,
      riskOverride: null,
      status: "FINALIZED",
      daysAgo: 4
    },
    // SCENARIO 3: Concessional Rate 5% Solar Installation (Rajasthan)
    {
      numberSuffix: "203",
      customer: createdCustomerEntities.find(c => c.state === "Rajasthan") || createdCustomerEntities[0],
      product: createdProductEntities.find(p => p.name.includes("Solar Photovoltaic")),
      qty: 2,
      discount: 3000,
      riskOverride: null,
      status: "VALIDATED",
      daysAgo: 7
    },
    // SCENARIO 4: 0% Nil-Rated Statutory Literature Invoice
    {
      numberSuffix: "204",
      customer: createdCustomerEntities.find(c => c.name.includes("Delhi")),
      product: createdProductEntities.find(p => p.name.includes("Statutory GST Handbook")),
      qty: 25,
      discount: 1000,
      riskOverride: null,
      status: "VALIDATED",
      daysAgo: 10
    },
    // SCENARIO 5: 12% Healthcare Equipment (Ahmedabad)
    {
      numberSuffix: "205",
      customer: createdCustomerEntities.find(c => c.state === "Gujarat"),
      product: createdProductEntities.find(p => p.name.includes("Diagnostic")),
      qty: 4,
      discount: 4000,
      riskOverride: null,
      status: "FINALIZED",
      daysAgo: 12
    },
    // SCENARIO 6: 28% Luxury HVAC Warning Case (> ₹50,000 threshold + 28% slab)
    {
      numberSuffix: "206",
      customer: createdCustomerEntities.find(c => c.state === "Tamil Nadu"),
      product: createdProductEntities.find(p => p.name.includes("VRF HVAC")),
      qty: 1,
      discount: 5000,
      riskOverride: null,
      status: "DRAFT",
      daysAgo: 15
    },
    // SCENARIO 7: High Value Heavy Industrial Generator (₹3.4L e-Way Bill check)
    {
      numberSuffix: "207",
      customer: createdCustomerEntities.find(c => c.state === "Telangana"),
      product: createdProductEntities.find(p => p.name.includes("Industrial Heavy Duty Diesel Generator")),
      qty: 1,
      discount: 10000,
      riskOverride: null,
      status: "VALIDATED",
      daysAgo: 18
    },
    // SCENARIO 8: AI Volume Anomaly (Bulk 45 Video Conferencing Systems ~ ₹80L)
    {
      numberSuffix: "208",
      customer: createdCustomerEntities.find(c => c.state === "Maharashtra"),
      product: createdProductEntities.find(p => p.name.includes("Logitech Rally Plus")),
      qty: 40, // Extreme volume surge!
      discount: 50000,
      riskOverride: "POTENTIAL_RISK",
      status: "DRAFT",
      daysAgo: 3
    },
    // SCENARIO 9: AI Extreme Discount Anomaly (40% discount on Cyber SOC service)
    {
      numberSuffix: "209",
      customer: createdCustomerEntities.find(c => c.state === "Delhi"),
      product: createdProductEntities.find(p => p.name.includes("Enterprise Cyber Security SOC")),
      qty: 2,
      discount: 140000, // 38.8% discount!
      riskOverride: "POTENTIAL_RISK",
      status: "DRAFT",
      daysAgo: 5
    },
    // SCENARIO 10: Unregistered Consumer B2C Cash Sale (0% GSTIN present)
    {
      numberSuffix: "210",
      customer: createdCustomerEntities.find(c => c.gstin === null) || createdCustomerEntities[createdCustomerEntities.length - 1],
      product: createdProductEntities.find(p => p.name.includes("Thermal Paper")),
      qty: 5,
      discount: 200,
      riskOverride: null,
      status: "FINALIZED",
      daysAgo: 8
    }
  ];

  let createdInvoicesCount = 0;

  for (const tpl of invoiceTemplates) {
    if (!tpl.customer || !tpl.product) continue;

    const invNum = `INV/2026/${tpl.numberSuffix}`;
    // Check if already exists
    const existing = await prisma.invoice.findFirst({
      where: { userId: user.id, invoiceNumber: invNum }
    });
    if (existing) continue;

    const isInterState = tpl.customer.state.trim().toLowerCase() !== "maharashtra";
    const qty = tpl.qty;
    const price = tpl.product.price;
    const discount = tpl.discount;
    const taxableAmount = Math.max(0, (qty * price) - discount);
    const rate = tpl.product.gstRate;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = Math.round(taxableAmount * (rate / 100) * 100) / 100;
    } else {
      cgst = Math.round(taxableAmount * (rate / 200) * 100) / 100;
      sgst = cgst;
    }

    const totalGst = cgst + sgst + igst;
    const grandTotal = Math.round((taxableAmount + totalGst) * 100) / 100;

    const invoicePayload = {
      invoiceNumber: invNum,
      invoiceDate: new Date(Date.now() - tpl.daysAgo * 86400000).toISOString(),
      customerName: tpl.customer.name,
      customerGstin: tpl.customer.gstin,
      customerState: tpl.customer.state,
      customerAddress: tpl.customer.address,
      supplierGstin: user.business?.gstin || "27AABCG1234F1Z5",
      supplierState: user.business?.state || "Maharashtra",
      subtotal: qty * price,
      discount,
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalGst,
      grandTotal,
      isInterState,
      items: [
        {
          productId: tpl.product.id,
          productName: tpl.product.name,
          hsnSac: tpl.product.hsnSac,
          quantity: qty,
          unitPrice: price,
          discount,
          taxableAmount,
          gstRate: rate,
          cgst,
          sgst,
          igst,
          total: grandTotal
        }
      ]
    };

    // Run real Rule Engine
    const ruleEval = validateGstRules(invoicePayload, [], existingInvoices);

    // Run real AI Anomaly Engine
    const aiEval = await analyzeInvoiceWithAI(invoicePayload);

    let finalRiskLevel = tpl.riskOverride || (ruleEval.status === "FAIL" || aiEval.riskLevel === "POTENTIAL_RISK" ? "POTENTIAL_RISK" : (ruleEval.status === "WARNING" || aiEval.riskLevel === "WARNING" ? "WARNING" : "VALID"));

    // Save full invoice record with relations
    const inv = await prisma.invoice.create({
      data: {
        userId: user.id,
        businessId: user.business?.id,
        invoiceNumber: invNum,
        invoiceDate: new Date(Date.now() - tpl.daysAgo * 86400000),
        customerName: tpl.customer.name,
        customerGstin: tpl.customer.gstin,
        customerState: tpl.customer.state,
        customerAddress: tpl.customer.address,
        subtotal: qty * price,
        discount,
        taxableAmount,
        cgst,
        sgst,
        igst,
        totalGst,
        grandTotal,
        status: tpl.status,
        riskLevel: finalRiskLevel,
        riskScore: aiEval.riskScore || 15.0,
        isInterState,
        items: {
          create: invoicePayload.items.map(it => ({
            productId: it.productId,
            productName: it.productName,
            hsnSac: it.hsnSac,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount,
            taxableAmount: it.taxableAmount,
            gstRate: it.gstRate,
            cgst: it.cgst,
            sgst: it.sgst,
            igst: it.igst,
            total: it.total
          }))
        },
        validationRules: {
          create: ruleEval.results.map(r => ({
            ruleId: r.ruleId,
            ruleName: r.ruleName,
            status: r.status,
            severity: r.severity,
            message: r.message,
            suggestedAction: r.suggestedAction
          }))
        },
        anomalyResult: {
          create: {
            anomalyScore: aiEval.anomalyScore || 0.35,
            isAnomaly: aiEval.isAnomaly || false,
            riskLevel: finalRiskLevel,
            explanation: aiEval.explanation || "Compliant transaction",
            featureContributions: JSON.stringify(aiEval.featureContributions || {}),
            suggestedActions: JSON.stringify(aiEval.suggestedActions || [])
          }
        }
      }
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: tpl.status === "FINALIZED" ? "INVOICE_FINALIZED" : "INVOICE_CREATED",
        entityType: "Invoice",
        entityId: inv.id,
        details: `Created demo transaction ${inv.invoiceNumber} for ${inv.customerName} (₹${inv.grandTotal}, Status: ${inv.status}, Risk: ${inv.riskLevel})`
      }
    });

    createdInvoicesCount++;
    console.log(`  -> Seeded Invoice: ${inv.invoiceNumber} | Customer: ${inv.customerName} | ₹${inv.grandTotal.toLocaleString("en-IN")} | ${inv.riskLevel}`);
  }

  console.log(`\n✅ Successfully seeded ${createdInvoicesCount} new curated demonstration invoices!`);

  // Final count summary
  const totalInv = await prisma.invoice.count();
  const totalProd = await prisma.product.count();
  const totalCust = await prisma.customer.count();
  const totalLogs = await prisma.auditLog.count();

  console.log("\n================================================================================");
  console.log("UPDATED DATABASE TOTALS:");
  console.log(`Invoices: ${totalInv} | Products: ${totalProd} | Customers: ${totalCust} | Audit Logs: ${totalLogs}`);
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

addRichDummyData().catch(e => {
  console.error("Error in addRichDummyData:", e);
  process.exit(1);
});
