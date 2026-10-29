import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      business: true,
      _count: {
        select: {
          invoices: true,
          products: true,
          customers: true
        }
      }
    }
  });

  console.log("All Users in Database:");
  users.forEach(u => {
    console.log({
      id: u.id,
      name: u.name,
      email: u.email,
      businessName: u.business?.businessName,
      invoicesCount: u._count.invoices,
      productsCount: u._count.products,
      customersCount: u._count.customers
    });
  });

  await prisma.$disconnect();
}

main().catch(console.error);

