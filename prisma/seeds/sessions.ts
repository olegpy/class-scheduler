import type {
  Child,
  Organization,
  PrismaClient,
  User,
} from "../../app/generated/prisma/client";

export async function seedSessions(
  prisma: PrismaClient,
  instructor: User,
  north: Organization,
  south: Organization,
  children: Child[],
) {
  const now = Date.now();
  const inThreeDays = new Date(now + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now + 5 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

  const amy = children.find((child) => child.name === "Amy");
  const ben = children.find((child) => child.name === "Ben");

  if (!amy || !ben) {
    throw new Error("Expected children Amy and Ben to exist before seeding sessions");
  }

  async function upsertSession(input: {
    title: string;
    startsAt: Date;
    capacity: number;
    organizationId: string;
  }) {
    const existing = await prisma.classSession.findFirst({
      where: { title: input.title, instructorId: instructor.id },
    });

    if (existing) {
      return prisma.classSession.update({
        where: { id: existing.id },
        data: {
          startsAt: input.startsAt,
          capacity: input.capacity,
          organizationId: input.organizationId,
          instructorId: instructor.id,
        },
      });
    }

    return prisma.classSession.create({
      data: {
        title: input.title,
        startsAt: input.startsAt,
        capacity: input.capacity,
        organizationId: input.organizationId,
        instructorId: instructor.id,
      },
    });
  }

  await upsertSession({
    title: "Beginner Soccer",
    startsAt: inThreeDays,
    capacity: 10,
    organizationId: north.id,
  });

  const fullSession = await upsertSession({
    title: "Full Yoga Class",
    startsAt: inFiveDays,
    capacity: 2,
    organizationId: north.id,
  });

  await prisma.enrollment.deleteMany({
    where: { sessionId: fullSession.id },
  });
  await prisma.enrollment.createMany({
    data: [
      { sessionId: fullSession.id, childId: amy.id },
      { sessionId: fullSession.id, childId: ben.id },
    ],
  });

  await upsertSession({
    title: "Past Art Workshop",
    startsAt: threeDaysAgo,
    capacity: 8,
    organizationId: south.id,
  });

  console.log("Seeded sessions: 1 open upcoming, 1 full upcoming, 1 past");
}
