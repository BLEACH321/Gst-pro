import { PrismaClient } from "@prisma/client";
import { validateGstRules } from "./rules/gstRuleEngine.js";
import { analyzeInvoiceWithAI } from "./services/aiService.js";

const prisma = new PrismaClient();

async function seedUserAccount() {
  console.log("================================================================================");
  console.log("SEEDING FULL COMPREHENSIVE DATA FOR LOGGED-IN USER: ZEESUNNY2145@GMAIL.COM");
  console.log("================================================================================\n");

  const targetEmail = "ZEESUNNY2145@GMAIL.COM";
  const user = await prisma.user.findFirst({
    where: { email: targetEmail },
    include: { business: true }
  });

  if (!user) {
    console.error(`User ${targetEmail} not found in database!`);
    process.exit(1);
  }

  console.log(`Found Target User: ${user.name} (ID: ${user.id})`);

  // 1. Ensure business profile has a valid 15-character GSTIN
  let businessGstin = user.business?.gstin;
  if (!businessGstin || businessGstin.length !== 15) {
    businessGstin = "27AABCB9876F1Z2"; // Valid 15-char Maharashtra GSTIN
  }

  const updatedBusiness = await prisma.business.upsert({
    where: { userId: user.id },
    update: {
      businessName: user.business?.businessName || "Bathkart & Tech Solutions Pvt Ltd",
      gstin: businessGstin,
      businessCategory: "Consumer Goods, Sanitaryware & IT Hardware",
      registrationType: "Regular",
      state: "Maharashtra",
      address: "Unit 301, Commercial Hub, MIDC Andheri East, Mumbai - 400093",
      email: targetEmail,
      phone: "+91 98200 12345"
    },
    create: {
      userId: user.id,
      businessName: "Bathkart & Tech Solutions Pvt Ltd",
      gstin: businessGstin,
      businessCategory: "Consumer Goods, Sanitaryware & IT Hardware",
      registrationType: "Regular",
      state: "Maharashtra",
      address: "Unit 301, Commercial Hub, MIDC Andheri East, Mumbai - 400093",
      email: targetEmail,
      phone: "+91 98200 12345"
    }
  });

  console.log(`✅ Business Profile Configured: ${updatedBusiness.businessName} (${updatedBusiness.gstin})\n`);

  // 2. Seed 20 Diverse Products (Bathroom fittings, Tech hardware, Appliances, Services)
  const productsCatalog = [
    // Sanitaryware & Bath Fittings (fitting the user's business "Bathkart")
    {
      name: "Kohler Modern Ceramic Wall-Hung Dual-Flush Toilet Suite",
      category: "Sanitaryware & Ceramic Fixtures",
      hsnSac: "69101000",
      gstRate: 18.0,
      price: 24500.0,
      unit: "SET",
      description: "Vitreous china glazed dual-flush rimless toilet suite with soft-close seat."
    },
    {
      name: "Grohe Eurosmart Single-Lever Basin Mixer Tap (Chrome)",
      category: "Bathroom Fittings & Faucets",
      hsnSac: "84818020",
      gstRate: 18.0,
      price: 6850.0,
      unit: "PCS",
      description: "German-engineered brass body chrome-plated basin mixer tap with SilkMove cartridge."
    },
    {
      name: "Jaquar Concealed Thermostatic Shower Valve with Rain Showerhead",
      category: "Bathroom Fittings & Faucets",
      hsnSac: "84818090",
      gstRate: 18.0,
      price: 18900.0,
      unit: "SET",
      description: "3-outlet concealed thermostatic temperature controller with 300mm rain shower."
    },
    {
      name: "Hindware Italian Collection Marble Composite Vanity Counter Basin",
      category: "Sanitaryware & Ceramic Fixtures",
      hsnSac: "69109000",
      gstRate: 18.0,
      price: 12500.0,
      unit: "NOS",
      description: "Stain-resistant engineered composite vanity washbasin with overflow drain."
    },
    {
      name: "A.O. Smith 25L Digital Instant Electric Water Heater (Geyser)",
      category: "Commercial Appliances",
      hsnSac: "84191920",
      gstRate: 18.0,
      price: 14990.0,
      unit: "PCS",
      description: "5-star rated glass-lined thermal storage water geyser with digital temperature display."
    },

    // Electronics & IT Hardware
    {
      name: "ASUS TUF Gaming A16 Laptop (Ryzen 7, 16GB RAM, 1TB SSD)",
      category: "Electronics & Computing",
      hsnSac: "84713010",
      gstRate: 18.0,
      price: 84990.0,
      unit: "PCS",
      description: "High-performance processing laptop for CAD rendering, gaming, and business computing."
    },
    {
      name: "Dell UltraSharp 27-inch 4K USB-C Hub Designer Monitor",
      category: "Electronics & Displays",
      hsnSac: "85285200",
      gstRate: 18.0,
      price: 32500.0,
      unit: "PCS",
      description: "Color-accurate 4K IPS display with 90W USB-C power delivery."
    },
    {
      name: "Cisco Catalyst 24-Port Gigabit Managed PoE+ Network Switch",
      category: "Networking & Telecommunications",
      hsnSac: "85176290",
      gstRate: 18.0,
      price: 48500.0,
      unit: "NOS",
      description: "Enterprise rack-mountable Ethernet switch with Power-over-Ethernet."
    },
    {
      name: "Smart POS Android Biometric Billing Terminal (4G / WiFi)",
      category: "POS Hardware & Terminals",
      hsnSac: "84705010",
      gstRate: 12.0,
      price: 18500.0,
      unit: "NOS",
      description: "Handheld touch billing terminal with integrated 58mm thermal receipt printer."
    },
    {
      name: "Apple iPad Pro 11-inch M4 (Wi-Fi, 256GB Space Black)",
      category: "Electronics & Computing",
      hsnSac: "84713090",
      gstRate: 18.0,
      price: 99900.0,
      unit: "PCS",
      description: "Ultra Retina XDR OLED display tablet for inventory tracking and retail demo."
    },

    // 0% and 5% Concessional & Exempt Products
    {
      name: "CBIC Statutory GST Handbook & Reference Guide (Printed Book)",
      category: "Books & Publications",
      hsnSac: "49011010",
      gstRate: 0.0,
      price: 1450.0,
      unit: "NOS",
      description: "Official published GST tariff schedules and statutory reference commentary (Exempt)."
    },
    {
      name: "Solar Photovoltaic Inverter & Power Conditioning Module (5KW)",
      category: "Renewable Energy Devices",
      hsnSac: "84191910",
      gstRate: 5.0,
      price: 68000.0,
      unit: "SET",
      description: "MNRE-certified solar grid-tied power inverter unit."
    },
    {
      name: "Inter-State Freight Cargo Transport (Goods Transport Agency)",
      category: "Logistics & Transport",
      hsnSac: "996511",
      gstRate: 5.0,
      price: 24500.0,
      unit: "TRP",
      description: "Road transportation of commercial goods with consignment note (GTA service)."
    },

    // 12% Healthcare & Consumables
    {
      name: "Digital Multipara Patient Health & Vital Signs Monitor",
      category: "Medical & Diagnostic",
      hsnSac: "90189019",
      gstRate: 12.0,
      price: 22000.0,
      unit: "PCS",
      description: "Clinical grade patient monitoring apparatus with digital pulse oximeter."
    },
    {
      name: "Thermal Billing Paper Rolls (80mm x 50m, Pack of 50 Rolls)",
      category: "Stationery & Consumables",
      hsnSac: "48119010",
      gstRate: 12.0,
      price: 2100.0,
      unit: "BOX",
      description: "Premium BPA-free thermal receipt rolls for cash registers."
    },

    // Professional & Cloud Services (18%)
    {
      name: "Cloud Server Hosting & Managed Database Infrastructure (Monthly)",
      category: "Information Technology",
      hsnSac: "998314",
      gstRate: 18.0,
      price: 28000.0,
      unit: "MTH",
      description: "High-availability cloud container management and real-time database hosting."
    },
    {
      name: "Enterprise Software Engineering & AI Integration Retainer",
      category: "Professional Services",
      hsnSac: "998313",
      gstRate: 18.0,
      price: 125000.0,
      unit: "SRV",
      description: "Custom full-stack software development and AI algorithm fine-tuning."
    },
    {
      name: "Enterprise Cyber Security SOC Monitoring & Audit Retainer",
      category: "Information Technology",
      hsnSac: "998315",
      gstRate: 18.0,
      price: 180000.0,
      unit: "QTR",
      description: "24/7 Security Operations Center monitoring and compliance assessment."
    },

    // 28% Luxury & Heavy Equipment
    {
      name: "Carrier Commercial Multi-Split VRF HVAC Outdoor Condenser (10 HP)",
      category: "Commercial HVAC Systems",
      hsnSac: "84158110",
      gstRate: 28.0,
      price: 285000.0,
      unit: "SET",
      description: "High-capacity variable refrigerant flow commercial central cooling system."
    },
    {
      name: "High-Capacity Industrial Heavy Duty Diesel Generator (25 KVA)",
      category: "Electrical Equipment",
      hsnSac: "85021100",
      gstRate: 28.0,
      price: 340000.0,
      unit: "NOS",
      description: "Silent canopy industrial generator for enterprise backup power."
    }
  ];

  const createdProducts = [];
  for (const p of productsCatalog) {
    const prod = await prisma.product.create({
      data: { ...p, userId: user.id }
    });
    createdProducts.push(prod);
  }
  console.log(`✅ Seeded ${createdProducts.length} Product Master items for ${targetEmail}.`);

  // 3. Seed 12 Multi-State Customers
  const customerList = [
    { name: "Acme Infotech Solutions LLP", gstin: "27AABCA5566G1Z9", state: "Maharashtra", address: "Bandra Kurla Complex, Mumbai" },
    { name: "Zenith Global Technologies Ltd", gstin: "29BBBCZ8899K1Z2", state: "Karnataka", address: "Electronic City Phase 1, Bengaluru" },
    { name: "Reliance Digital Enterprise Alliance", gstin: "24AABCR1234P1Z3", state: "Gujarat", address: "GIDC Industrial Zone, Ahmedabad" },
    { name: "Tata Smart Consulting Services", gstin: "27AAACT9999R1Z1", state: "Maharashtra", address: "Nariman Point, South Mumbai" },
    { name: "Delhi Capital Tech & Cyber Solutions", gstin: "07AAACD9988P1Z5", state: "Delhi", address: "Barakhamba Road, Connaught Place, New Delhi" },
    { name: "Pinnacle Logistics & Freight Hub", gstin: "33AAACP4444T1Z8", state: "Tamil Nadu", address: "OMR IT Highway, Chennai" },
    { name: "Telangana Cloud Grid Data Systems", gstin: "36AAACT1122C1Z7", state: "Telangana", address: "Hitec City, Madhapur, Hyderabad" },
    { name: "Gujarat Industrial Power Corp Ltd", gstin: "24AAACG3333M1Z6", state: "Gujarat", address: "Petrochemicals Complex, Vadodara" },
    { name: "Rajasthan Heritage Solar Parks LLP", gstin: "08AAACR8877S1Z2", state: "Rajasthan", address: "Bhadla Solar Industrial Zone, Jodhpur" },
    { name: "West Bengal Eastern Distributing Traders", gstin: "19AAACW5566R1Z9", state: "West Bengal", address: "Salt Lake Sector V, Kolkata" },
    { name: "Bharat Petroleum Logistics Hub", gstin: "27AABCB0001Z1Z0", state: "Maharashtra", address: "Refinery Gate 3, Mahul, Mumbai" },
    { name: "Local SME Builder & Contractor", gstin: null, state: "Maharashtra", address: "Shop 12, APMC Market Yard, Navi Mumbai" }
  ];

  const createdCustomers = [];
  for (const c of customerList) {
    const cust = await prisma.customer.create({
      data: {
        ...c,
        userId: user.id,
        email: `accounts@${c.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 15)}.in`,
        phone: "+91 " + Math.floor(9000000000 + Math.random() * 999999999)
      }
    });
    createdCustomers.push(cust);
  }
  console.log(`✅ Seeded ${createdCustomers.length} Customer records for ${targetEmail}.\n`);

  // 4. Generate 105 Realistic Invoices Across Last 6 Months
  console.log("⏳ Generating 105 realistic historical invoice transactions with Explainable AI data...");
  const monthsAgo = 6;
  const now = new Date();

  let totalTaxableAccumulator = 0;
  let totalGstAccumulator = 0;
  let totalRevenueAccumulator = 0;
  let validatedCount = 0;
  let warningCount = 0;
  let anomalyCount = 0;

  for (let i = 1; i <= 105; i++) {
    const invNum = `INV/2026/${String(i).padStart(4, "0")}`;
    const daysOffset = Math.floor(Math.random() * (monthsAgo * 30));
    const invDate = new Date(now.getTime() - daysOffset * 24 * 60 * 60 * 1000);

    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    const isInterState = customer.state !== "Maharashtra";

    const isAnomalyCase = i % 10 === 0; // ~10% anomalies
    const isWarningCase = i % 6 === 0 && !isAnomalyCase; // ~15% warnings

    let itemsToCreate = [];
    let subtotal = 0;
    let discount = 0;
    let taxableAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalGst = 0;
    let grandTotal = 0;
    let riskLevel = "VALID";
    let riskScore = Math.floor(Math.random() * 20) + 5; // 5-25%
    let explanation = "Compliant / No Risk";
    let reasons = ["All financial metrics, quantities, and GST rates conform to historical business norms."];
    let actions = ["Invoice is ready for final approval, e-invoice generation, and dispatch."];
    let featureContributions = {
      "Total Invoice Amount": 14.5,
      "Total Item Quantity": 12.0,
      "Taxable Base Value": 18.2,
      "Effective GST Rate": 15.0,
      "Customer Historical Deviation": 6.3
    };

    if (isAnomalyCase) {
      // High-Ticket Anomaly (Bulk 40 Laptops or High Value Order)
      const prod = createdProducts.find(p => p.name.includes("ASUS TUF")) || createdProducts[0];
      const qty = Math.floor(Math.random() * 35) + 35; // 35-70 units!
      const price = prod.price;
      discount = 20000;
      subtotal = qty * price;
      taxableAmount = subtotal - discount;

      const taxRate = prod.gstRate;
      if (isInterState) {
        igst = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
      } else {
        cgst = Math.round(taxableAmount * (taxRate / 200) * 100) / 100;
        sgst = cgst;
      }
      totalGst = cgst + sgst + igst;
      grandTotal = Math.round((taxableAmount + totalGst) * 100) / 100;

      riskLevel = "POTENTIAL_RISK";
      riskScore = Math.floor(Math.random() * 20) + 75; // 75-95%
      explanation = "Potential Risk Detected";
      reasons = [
        `Invoice amount (₹${grandTotal.toLocaleString("en-IN")}) is 450% higher than historical customer transaction average.`,
        `Unusual high batch quantity (${qty} units) deviates significantly from catalog benchmarks.`,
        `Commercial consignment value exceeds ₹50,000 threshold requiring mandatory e-Way bill and dual sign-off.`
      ];
      actions = [
        "Verify customer purchase order (PO) reference number and dual credit limit approval.",
        "Ensure e-Way bill is generated on the NIC portal before warehouse dispatch.",
        "Confirm inventory stock availability in the enterprise warehouse system."
      ];
      featureContributions = {
        "Total Invoice Amount": 46.8,
        "Total Item Quantity": 32.4,
        "Customer Historical Deviation": 28.5,
        "Taxable Base Value": 22.1,
        "Discount Percentage": 8.2
      };

      itemsToCreate.push({
        productId: prod.id,
        productName: prod.name,
        hsnSac: prod.hsnSac,
        quantity: qty,
        unitPrice: price,
        discount,
        taxableAmount,
        gstRate: taxRate,
        cgst,
        sgst,
        igst,
        total: grandTotal
      });
      anomalyCount++;

    } else if (isWarningCase) {
      // Warning: 28% Luxury AC or high-ticket generator
      const prod = createdProducts.find(p => p.gstRate === 28.0) || createdProducts[createdProducts.length - 1];
      const qty = 2;
      const price = prod.price;
      discount = 5000;
      subtotal = qty * price;
      taxableAmount = subtotal - discount;

      if (isInterState) {
        igst = Math.round(taxableAmount * 0.28 * 100) / 100;
      } else {
        cgst = Math.round(taxableAmount * 0.14 * 100) / 100;
        sgst = cgst;
      }
      totalGst = cgst + sgst + igst;
      grandTotal = Math.round((taxableAmount + totalGst) * 100) / 100;

      riskLevel = "WARNING";
      riskScore = Math.floor(Math.random() * 18) + 42; // 42-60%
      explanation = "Warning: Requires Verification";
      reasons = [
        "Applicable GST rate is 28% (highest bracket/luxury commercial appliance).",
        "Consignment value exceeds ₹50,000 threshold (Rule 138 e-Way Bill applicable)."
      ];
      actions = [
        "Confirm HSN/SAC classification against the latest CBIC 28% notification schedule.",
        "Check e-Way bill compliance requirement."
      ];
      featureContributions = {
        "Effective GST Rate": 38.0,
        "Total Invoice Amount": 26.5,
        "Taxable Base Value": 20.0,
        "Total Item Quantity": 12.0
      };

      itemsToCreate.push({
        productId: prod.id,
        productName: prod.name,
        hsnSac: prod.hsnSac,
        quantity: qty,
        unitPrice: price,
        discount,
        taxableAmount,
        gstRate: 28.0,
        cgst,
        sgst,
        igst,
        total: grandTotal
      });
      warningCount++;

    } else {
      // Normal standard transaction
      const prod1 = createdProducts[Math.floor(Math.random() * (createdProducts.length - 4))];
      const prod2 = createdProducts[Math.floor(Math.random() * 4)];
      const selected = [prod1];
      if (i % 3 === 0 && prod1.id !== prod2.id) selected.push(prod2);

      for (const p of selected) {
        const qty = Math.floor(Math.random() * 4) + 1;
        const disc = Math.floor(Math.random() * 3) * 500;
        const taxBase = Math.max(0, (qty * p.price) - disc);
        const rate = p.gstRate;

        let itCgst = 0;
        let itSgst = 0;
        let itIgst = 0;

        if (isInterState) {
          itIgst = Math.round(taxBase * (rate / 100) * 100) / 100;
        } else {
          itCgst = Math.round(taxBase * (rate / 200) * 100) / 100;
          itSgst = itCgst;
        }
        const itTotal = Math.round((taxBase + itCgst + itSgst + itIgst) * 100) / 100;

        subtotal += qty * p.price;
        discount += disc;
        taxableAmount += taxBase;
        cgst += itCgst;
        sgst += itSgst;
        igst += itIgst;
        totalGst += (itCgst + itSgst + itIgst);
        grandTotal += itTotal;

        itemsToCreate.push({
          productId: p.id,
          productName: p.name,
          hsnSac: p.hsnSac,
          quantity: qty,
          unitPrice: p.price,
          discount: disc,
          taxableAmount: taxBase,
          gstRate: rate,
          cgst: itCgst,
          sgst: itSgst,
          igst: itIgst,
          total: itTotal
        });
      }
      validatedCount++;
    }

    totalTaxableAccumulator += taxableAmount;
    totalGstAccumulator += totalGst;
    totalRevenueAccumulator += grandTotal;

    const invStatus = riskLevel === "VALID" ? "VALIDATED" : (i % 2 === 0 ? "FINALIZED" : "DRAFT");

    // Save invoice to database
    await prisma.invoice.create({
      data: {
        userId: user.id,
        businessId: updatedBusiness.id,
        invoiceNumber: invNum,
        invoiceDate: invDate,
        customerName: customer.name,
        customerGstin: customer.gstin,
        customerState: customer.state,
        customerAddress: customer.address,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
        igst: Math.round(igst * 100) / 100,
        totalGst: Math.round(totalGst * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        status: invStatus,
        riskLevel,
        riskScore,
        isInterState,
        items: {
          create: itemsToCreate
        },
        validationRules: {
          create: [
            {
              ruleId: "RULE-GST-001",
              ruleName: "Supplier GSTIN Format Check",
              status: "PASS",
              severity: "INFO",
              message: "Supplier GSTIN is valid (Maharashtra)."
            },
            {
              ruleId: "RULE-GST-002",
              ruleName: "Mandatory Fields Verification",
              status: "PASS",
              severity: "INFO",
              message: "All mandatory GST statutory fields are provided."
            },
            {
              ruleId: "RULE-GST-005",
              ruleName: "Place of Supply Tax Allocation",
              status: "PASS",
              severity: "INFO",
              message: isInterState ? "Inter-state supply: 100% IGST applied correctly." : "Intra-state supply: CGST and SGST allocated equally."
            },
            {
              ruleId: "RULE-GST-006",
              ruleName: "Line Item Tax Math Verification",
              status: "PASS",
              severity: "INFO",
              message: "All item-level quantities, prices, discounts, and taxable bases compute accurately."
            },
            {
              ruleId: "RULE-GST-007",
              ruleName: "Grand Total Reconciliation",
              status: "PASS",
              severity: "INFO",
              message: `Invoice total (₹${grandTotal.toFixed(2)}) reconciles perfectly.`
            }
          ]
        },
        anomalyResult: {
          create: {
            anomalyScore: Number((riskScore / 100).toFixed(4)),
            isAnomaly: isAnomalyCase,
            riskLevel,
            explanation,
            featureContributions: JSON.stringify(featureContributions),
            suggestedActions: JSON.stringify(actions)
          }
        }
      }
    });

    if (i % 25 === 0) {
      console.log(`  -> Generated ${i}/105 invoices...`);
    }
  }

  // 5. Seed Audit Logs
  console.log("Generating 15 realistic audit logs...");
  const recentInvs = await prisma.invoice.findMany({
    where: { userId: user.id },
    take: 15,
    orderBy: { createdAt: "desc" }
  });

  for (const inv of recentInvs) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: inv.status === "FINALIZED" ? "INVOICE_FINALIZED" : "INVOICE_CREATED",
        entityType: "Invoice",
        entityId: inv.id,
        details: `Created invoice ${inv.invoiceNumber} for ${inv.customerName} (₹${inv.grandTotal}, Status: ${inv.status}, Risk: ${inv.riskLevel})`
      }
    });
  }

  console.log("\n================================================================================");
  console.log("SUCCESSFULLY POPULATED ACCOUNT: " + targetEmail);
  console.log("================================================================================");
  console.log(`Total Invoices: 105`);
  console.log(`Validated / Compliant: ${validatedCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log(`Potential Risk / Anomalies: ${anomalyCount}`);
  console.log(`Total Taxable Volume: ₹${Math.round(totalTaxableAccumulator).toLocaleString("en-IN")}`);
  console.log(`Total GST Assessed: ₹${Math.round(totalGstAccumulator).toLocaleString("en-IN")}`);
  console.log(`Total Revenue: ₹${Math.round(totalRevenueAccumulator).toLocaleString("en-IN")}`);
  console.log(`Products in Catalog: ${createdProducts.length}`);
  console.log(`Customer Directory: ${createdCustomers.length}`);
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

seedUserAccount().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
