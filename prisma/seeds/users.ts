import type { PrismaClient } from "../../app/generated/prisma/client";
import { ORGANIZATION_NAMES } from "./organizations";

export async function seedUsers(prisma: PrismaClient) {
  const parent = await prisma.user.create({
    data: {
      name: "Pat Parent",
      email: "parent@example.com",
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: "Ira Instructor",
      email: "instructor@example.com",
    },
  });

  const north = await prisma.organization.findFirstOrThrow({
    where: { name: ORGANIZATION_NAMES.north },
  });
  const south = await prisma.organization.findFirstOrThrow({
    where: { name: ORGANIZATION_NAMES.south },
  });

  await prisma.membership.deleteMany({
    where: { userId: { in: [parent.id, instructor.id] } },
  });
  await prisma.membership.create({
    data: {
      userId: parent.id,
      organizationId: north.id,
      role: "PARENT",
    },
  });
  await prisma.membership.createMany({
    data: [
      {
        userId: instructor.id,
        organizationId: north.id,
        role: "INSTRUCTOR",
      },
      {
        userId: instructor.id,
        organizationId: south.id,
        role: "INSTRUCTOR",
      },
    ],
  });

  console.log("Seeded parent + instructor and memberships");

  return { parent, instructor, north, south };
}
