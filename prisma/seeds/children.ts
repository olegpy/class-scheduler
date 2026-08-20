import type { PrismaClient, User } from "../../app/generated/prisma/client";

export async function seedChildren(prisma: PrismaClient, parent: User) {
  const names = ["Amy", "Ben"];

  for (const name of names) {
    const existing = await prisma.child.findFirst({
      where: { name, parentId: parent.id },
    });

    if (existing) {
      continue;
    }

    await prisma.child.create({
      data: { name, parentId: parent.id },
    });
  }

  const children = await prisma.child.findMany({
    where: { parentId: parent.id },
  });

  console.log(`Seeded ${children.length} children for parent`);

  return children;
}
