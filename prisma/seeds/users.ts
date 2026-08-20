import type { PrismaClient } from "../../app/generated/prisma/client";

export async function seedUsers(prisma: PrismaClient) {
  const users = [
    {
      name: "Oleg Parent",
      email: "parent@example.com",
    },
    {
      name: "Alex Instructor",
      email: "instructor@example.com",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name },
      create: user,
    });
  }

  console.log(`Seeded ${users.length} users`);
}
