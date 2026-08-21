import {getCurrentUser} from "@/app/lib/auth";
import {db} from "@/app/lib/db";
import {EnrollmentForm} from "@/app/components/EnrollmentForm";

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-CA",{
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date)
}
export default async function Sessions() {
    const user = await getCurrentUser()
    if (!user) {
        return <main className="mx-auto w-full">No Users Found</main>
    }

    const now = new Date();

    const memberships = user.memberships;
    const roles = memberships.map(
        (membership) => membership.role
    )
    const isParent = roles.includes("PARENT")
    const isInstructor = roles.includes("INSTRUCTOR")

    const organisationsIds = memberships.map((membership) => membership.organizationId)

    const sessions = await db.classSession.findMany({
        where: {
            startsAt: { gt: now },
            organizationId: {
                in: organisationsIds
            },
            ...(isInstructor && !isParent) ? { instructorId: user.id } : {}
        },
        orderBy: { startsAt: "asc" },
        include: {
            instructor: { select: { name: true } },
            organisation: { select: { name: true } },
            enrollments: { select: { childId: true } },
        }
    })
    return (
        <main>
            <p>Signed in as {user.name} ({user.email})</p>
            { sessions.length === 0 ? (
                <div>No upcoming sessions are available for this suser</div>
            ) : (
                <div className="grid gap-4">
                    { sessions.map((session) => {
                        const seatsRemaining = Math.max(session.capacity - session.enrollments.length, 0);
                        const full = seatsRemaining === 0;
                        const enrolledChildIds = new Set(session.enrollments.map((enrollment) => enrollment.childId))
                        const availableChildren = user.children.filter((child) => !enrolledChildIds.has(child.id))
                        return (
                            <article key={session.id} className="border bg-white p-5">
                                <div className="flex flex-col">
                                    <div>
                                        <h2 className="text-xl">{session.title}</h2>
                                        <p className="mt-1 text-zinc-600">{formatDate(session.startsAt)}</p>
                                        <p className="mt-2 text-zinc-500">
                                            { session.organisation.name } Instructor: { session.instructor.name }
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-100">
                                        {seatsRemaining} {seatsRemaining === 1 ? "seat" : "seats"} remaining
                                    </div>
                                </div>

                                {isParent && (
                                    <EnrollmentForm
                                        sessionId={session.id}
                                        availableChildren={availableChildren}
                                        disabled={full}
                                        disabledReason={
                                            full
                                                ? "This session is full."
                                                : availableChildren.length === 0
                                                    ? "All of your children are already enrolled."
                                                    : undefined
                                        }
                                    />
                                )}
                            </article>
                        )
                    }) }
                </div>
            ) }
        </main>
    )
}
