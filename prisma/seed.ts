import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { seedOrganizations } from "./seeds/organizations";
import { seedUsers } from "./seeds/users";
import { seedChildren } from "./seeds/children";
import { seedSessions } from "./seeds/sessions";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedOrganizations(prisma);
  const { parent, instructor, north, south } = await seedUsers(prisma);
  const children = await seedChildren(prisma, parent);
  await seedSessions(prisma, instructor, north, south, children);

  console.log("\nSeed complete (IDs are auto cuid strings).");
  console.log({
    parentId: parent.id,
    instructorId: instructor.id,
    childIds: children.map((child) => child.id),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
