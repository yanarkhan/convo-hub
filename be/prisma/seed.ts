/// <reference types="node" />
import { PrismaClient } from "../src/generated/prisma/client";
import { RoleType } from "../src/generated/prisma/enums";

const prisma = new PrismaClient();

async function main() {
  console.log("Start the role seeding process...");

  const rolesToSeed: { role: RoleType }[] = [
    { role: "ADMIN" },
    { role: "USER" },
    { role: "OWNER" },
    { role: "MEMBER" },
  ];

  const result = await prisma.role.createMany({
    data: rolesToSeed,
    skipDuplicates: true,
  });

  console.log(`Success Seeding Roles. ${result.count} new roles added.`);
}

main()
  .catch(async (err) => {
    console.error("Error during seeding process: ", err);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding process complete. Closing the prism connection...");
    await prisma.$disconnect();
  });
