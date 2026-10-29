import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "ZEESUNNY2145@GMAIL.COM" },
    include: { business: true }
  });

  console.log("User details:", JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
