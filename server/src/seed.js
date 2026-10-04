import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_RULES } from "./routes/rules.js";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting GST Sahayak database seeding...");

  // 1. Clean existing records if any
  await prisma.auditLog.deleteMany({});
  await prisma.validationResult.deleteMany({});
  await prisma.anomalyResult.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.validationRule.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Default Business User (Policy compliant: Uppercase initial, letters, numbers, symbol @, 8+ chars)
  const passwordHash = await bcrypt.hash("Demo@1234", 10);
  const user = await prisma.user.create({
    data: {
      name: "Sunny Gupta",
      email: "sunny@gstpro.com",
      password: passwordHash,
      role: "business_user",
      business: {
        create: {
          businessName: "Gupta Enterprise Infotech Pvt Ltd",
          gstin: "27AABCG1234F1Z5",
          businessCategory: "Electronics, IT Hardware & Cloud Services",
          registrationType: "Regular",
          state: "Maharashtra",
          address: "Unit 402, Signature IT Tower, MIDC Knowledge Park, Andheri (E), Mumbai - 400093",
          email: "billing@guptainfotech.com",
          phone: "+91 98201 54321"
        }
      }
    },
    include: { business: true }
  });

  console.log(`✅ Created Primary User: ${user.name} (${user.email})`);

  // 3. Create Default Products
  const productsData = [
    {
      name: "ASUS TUF A16 Gaming Laptop (AMD Ryzen 7, 16GB, 1TB SSD)",
      category: "Electronics & IT Hardware",
      hsnSac: "84713010",
      gstRate: 18.0,
      price: 84990.0,
      unit: "PCS",
      description: "High performance AI-ready gaming and workstation laptop with Radeon graphics."
    },
    {
      name: "Dell UltraSharp 27-inch 4K USB-C Hub Monitor",
      category: "Electronics & IT Hardware",
      hsnSac: "85285200",
      gstRate: 18.0,
      price: 32500.0,
      unit: "PCS",
      description: "Color-accurate 4K IPS display for design and engineering workflows."
    },
    {
      name: "Ergonomic Mesh High-Back Office Executive Chair",
      category: "Office Supplies & Furniture",
      hsnSac: "94031000",
      gstRate: 18.0,
      price: 14200.0,
      unit: "PCS",
      description: "Lumbar support adjustable swivel mesh executive chair."
    },
    {
      name: "Cloud Server Hosting & Managed DevOps Infrastructure (Monthly)",
      category: "Information Technology",
      hsnSac: "998314",
      gstRate: 18.0,
      price: 28000.0,
      unit: "MTH",
      description: "High availability Kubernetes cluster management and cloud storage."
    },
    {
      name: "Enterprise Software Engineering & AI Integration Retainer",
      category: "Professional Services",
      hsnSac: "998313",
      gstRate: 18.0,
      price: 125000.0,
      unit: "SRV",
      description: "Custom software engineering and machine learning model fine-tuning services."
    },
    {
      name: "Daikin 1.5 Ton 5-Star Inverter Split Air Conditioner",
      category: "Commercial Appliances",
      hsnSac: "84151010",
      gstRate: 28.0,
      price: 45900.0,
      unit: "PCS",
      description: "Commercial energy-efficient inverter cooling unit for server rooms and offices."
    },
    {
      name: "Executive Leather Bound Hardcover Journal & Stationeries Pack",
      category: "Stationery & Office Supplies",
      hsnSac: "48201090",
      gstRate: 12.0,
      price: 1850.0,
      unit: "SET",
      description: "Premium stationery set with executive planner and metal stylus pen."
    }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: { ...p, userId: user.id }
    });
    createdProducts.push(prod);
  }
  console.log(`✅ Seeded ${createdProducts.length} Product Master items.`);

  // 4. Create Customers
  const customerData = [
    { name: "Acme Infotech Solutions LLP", gstin: "27AABCA5566G1Z9", state: "Maharashtra", address: "Bandra Kurla Complex, Mumbai" },
    { name: "Zenith Global Technologies Ltd", gstin: "29BBBCZ8899K1Z2", state: "Karnataka", address: "Electronic City Phase 1, Bengaluru" },
    { name: "Reliance Digital Enterprise Alliance", gstin: "24AABCR1234P1Z3", state: "Gujarat", address: "GIDC Industrial Zone, Ahmedabad" },
    { name: "Tata Smart Consulting Services", gstin: "27AAACT9999R1Z1", state: "Maharashtra", address: "Nariman Point, South Mumbai" },
    { name: "Apex Retailers & Distributors", gstin: "07AAACA1111A1Z0", state: "Delhi", address: "Connaught Place, Central Delhi" },
    { name: "Pinnacle Logistics & Freight Hub", gstin: "33AAACP4444T1Z8", state: "Tamil Nadu", address: "OMR IT Highway, Chennai" },
    { name: "Sharma Electronic Enterprises", gstin: null, state: "Maharashtra", address: "Lamington Road, Grant Road, Mumbai" }
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({
      data: { ...c, userId: user.id, email: `accounts@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.in`, phone: "+91 99300 " + Math.floor(10000 + Math.random() * 90000) }
    });
    createdCustomers.push(cust);
  }
  console.log(`✅ Seeded ${createdCustomers.length} Customer records.`);

  // 5. Create Validation Rules
  for (const r of DEFAULT_RULES) {
    await prisma.validationRule.create({ data: r });
  }
  console.log(`✅ Seeded ${DEFAULT_RULES.length} GST validation rules.`);

  // 6. Generate 110 Historical Invoices (including normal, warnings, and synthetic anomalies)
  console.log("⏳ Generating 110 realistic historical invoice transactions with Explainable AI data...");
  const monthsAgo = 5;
  const now = new Date();

  for (let i = 1; i <= 110; i++) {
    const invNum = `INV/2026/${String(i).padStart(4, "0")}`;
    const daysOffset = Math.floor(Math.random() * (monthsAgo * 30));
    const invDate = new Date(now.getTime() - daysOffset * 24 * 60 * 60 * 1000);
    
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    const isInterState = customer.state !== "Maharashtra";

    // Decide if this invoice should be Normal, Warning, or Anomaly
    const isAnomalyCase = i % 12 === 0; // ~8% anomalies
    const isWarningCase = i % 7 === 0 && !isAnomalyCase; // ~14% warnings

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
    let riskScore = Math.floor(Math.random() * 22) + 5; // 5-27%
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
      // Create high-ticket anomaly (e.g. 85 laptops or huge surge)
      const prod = createdProducts[0]; // ASUS TUF
      const qty = Math.floor(Math.random() * 40) + 50; // 50 to 90 units!
      const price = prod.price;
      discount = 25000;
      subtotal = qty * price;
      taxableAmount = subtotal - discount;
      
      const taxRate = 18.0;
      if (isInterState) {
        igst = Math.round(taxableAmount * 0.18 * 100) / 100;
      } else {
        cgst = Math.round(taxableAmount * 0.09 * 100) / 100;
        sgst = cgst;
      }
      totalGst = cgst + sgst + igst;
      grandTotal = Math.round((taxableAmount + totalGst) * 100) / 100;

      riskLevel = "POTENTIAL_RISK";
      riskScore = Math.floor(Math.random() * 20) + 75; // 75-95%
      explanation = "Potential Risk Detected";
      reasons = [
        `Invoice amount (₹${grandTotal.toLocaleString("en-IN")}) is 480% higher than historical customer transaction average.`,
        `Unusual high volume (${qty} units) exceeds normal single-order batch size.`,
        `Commercial consignment value exceeds ₹50,000 requiring statutory e-Way bill and dual sign-off.`
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
        discount: discount,
        taxableAmount: taxableAmount,
        gstRate: taxRate,
        cgst,
        sgst,
        igst,
        total: grandTotal
      });

    } else if (isWarningCase) {
      // Warning: Higher discount or luxury AC bracket
      const prod = createdProducts[5]; // Daikin AC (28% GST)
      const qty = 4;
      const price = prod.price;
      discount = 8000;
      subtotal = qty * price;
      taxableAmount = subtotal - discount;
      
      if (isInterState) {
        igst = Math.round(taxableAmount * 0.28 * 100) / 100;
      } else {
        cgst = Math.round(taxableAmount * 0.14 * 100) / 100;
        sgst = cgst;
      }
      totalGst = cgst + sgst + igst;
      grandTotal = taxableAmount + totalGst;

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

    } else {
      // Normal transaction
      const prod1 = createdProducts[Math.floor(Math.random() * (createdProducts.length - 2))];
      const prod2 = createdProducts[Math.floor(Math.random() * 3)];
      const itemsList = [prod1];
      if (i % 3 === 0 && prod1.id !== prod2.id) itemsList.push(prod2);

      for (const prod of itemsList) {
        const qty = Math.floor(Math.random() * 3) + 1;
        const price = prod.price;
        const itemDisc = Math.floor(Math.random() * 500);
        const itemTaxable = (qty * price) - itemDisc;
        let itCgst = 0, itSgst = 0, itIgst = 0;

        if (isInterState) {
          itIgst = Math.round(itemTaxable * (prod.gstRate / 100) * 100) / 100;
        } else {
          itCgst = Math.round(itemTaxable * (prod.gstRate / 200) * 100) / 100;
          itSgst = itCgst;
        }
        const itTotal = itemTaxable + itCgst + itSgst + itIgst;

        subtotal += (qty * price);
        discount += itemDisc;
        taxableAmount += itemTaxable;
        cgst += itCgst;
        sgst += itSgst;
        igst += itIgst;

        itemsToCreate.push({
          productId: prod.id,
          productName: prod.name,
          hsnSac: prod.hsnSac,
          quantity: qty,
          unitPrice: price,
          discount: itemDisc,
          taxableAmount: itemTaxable,
          gstRate: prod.gstRate,
          cgst: itCgst,
          sgst: itSgst,
          igst: itIgst,
          total: itTotal
        });
      }

      totalGst = cgst + sgst + igst;
      grandTotal = Math.round((taxableAmount + totalGst) * 100) / 100;
    }

    // Create invoice record
    await prisma.invoice.create({
      data: {
        userId: user.id,
        businessId: user.business.id,
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
        status: riskLevel === "VALID" ? "VALIDATED" : "DRAFT",
        riskLevel,
        riskScore,
        isInterState,
        createdAt: invDate,
        items: {
          create: itemsToCreate
        },
        validationRules: {
          create: [
            { ruleId: "RULE-GST-001", ruleName: "GSTIN Format Check", status: "PASS", severity: "INFO", message: "GSTIN format verified." },
            { ruleId: "RULE-GST-002", ruleName: "Mandatory Fields", status: "PASS", severity: "INFO", message: "All statutory fields present." },
            { ruleId: "RULE-GST-003", ruleName: "HSN/SAC Validation", status: "PASS", severity: "INFO", message: "Valid HSN codes." },
            { ruleId: "RULE-GST-004", ruleName: "GST Rate Check", status: riskLevel === "WARNING" ? "WARNING" : "PASS", severity: riskLevel === "WARNING" ? "WARNING" : "INFO", message: riskLevel === "WARNING" ? "28% luxury bracket slab" : "Standard rate slab" },
            { ruleId: "RULE-GST-005", ruleName: "Tax Allocation Check", status: "PASS", severity: "INFO", message: isInterState ? "IGST applied correctly." : "CGST and SGST split equally." },
            { ruleId: "RULE-GST-006", ruleName: "Tax Math Verification", status: "PASS", severity: "INFO", message: "Line items math accurate." },
            { ruleId: "RULE-GST-007", ruleName: "Total Consistency", status: "PASS", severity: "INFO", message: "Grand total reconciles." }
          ]
        },
        anomalyResult: {
          create: {
            anomalyScore: riskScore / 100.0,
            isAnomaly: riskLevel === "POTENTIAL_RISK",
            riskLevel,
            explanation,
            featureContributions: JSON.stringify(featureContributions),
            suggestedActions: JSON.stringify(actions)
          }
        }
      }
    });
  }

  // Audit log entry
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DATABASE_SEEDED",
      entityType: "System",
      entityId: "SYS-INIT",
      details: "Initialized database with 110 demo historical invoices and ML models."
    }
  });

  console.log("🎉 Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
