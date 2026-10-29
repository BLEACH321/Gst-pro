import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.count();
  const businesses = await prisma.business.count();
  const products = await prisma.product.count();
  const customers = await prisma.customer.count();
  const invoices = await prisma.invoice.count();
  const rules = await prisma.validationRule.count();
  const auditLogs = await prisma.auditLog.count();

  console.log("Current Database Statistics:");
  console.log({ users, businesses, products, customers, invoices, rules, auditLogs });

  const firstUser = await prisma.user.findFirst({ include: { business: true } });
  console.log("Primary Demo User:", {
    id: firstUser?.id,
    name: firstUser?.name,
    email: firstUser?.email,
    businessName: firstUser?.business?.businessName,
    gstin: firstUser?.business?.gstin
  });

  await prisma.$disconnect();
}

check().catch(console.error);

