import type { PrismaClient } from "../../app/generated/prisma/client";

export const ORGANIZATION_NAMES = {
  north: "North Side Classes",
  south: "South Side Classes",
} as const;

export async function seedOrganizations(prisma: PrismaClient) {
  const names = Object.values(ORGANIZATION_NAMES);

  for (const name of names) {
    const existing = await prisma.organization.findFirst({ where: { name } });

    if (existing) {
      continue;
    }

    await prisma.organization.create({ data: { name } });
  }

  console.log(`Seeded ${names.length} organizations`);
}
