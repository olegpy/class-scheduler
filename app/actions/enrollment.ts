"use server";

import {revalidatePath} from "next/cache";
import {getCurrentUser} from "@/app/lib/auth";
import {db} from "@/app/lib/db";
import {getEnrollmentBlockReason} from "@/app/lib/enrollmentRules";

export type EnrollState = {
    ok: boolean;
    message: string;
}

export async function enrollChild(
    _previousState: EnrollState,
    formData: FormData
): Promise<EnrollState>{
    const sessionId = String(formData.get("sessionId") ?? "");
    const childId = String(formData.get("childId") ?? "");
    if (!sessionId || !childId) {
        return {
            ok: false,
            message: "Session and child are required"
        }
    }

    const user = await getCurrentUser();
    if (!user) {
        return {
            ok: false,
            message: "Please sign in"
        }
    }

    const parentMemberships = user.memberships.filter(
        (membership) => membership.role === "PARENT"
    );
    const isParent = parentMemberships.length > 0;
    const parentOrgIds = new Set(
        parentMemberships.map((membership) => membership.organizationId)
    );

    try {
        await db.$transaction(async (tx) => {
            const lockedSessions = await tx.$queryRaw<Array<{
                id: string;
                organizationId: string;
                startsAt: Date;
                capacity: number
            }>>`
                SELECT "id", "organizationId", "startsAt", "capacity"
                FROM "ClassSession"
                WHERE "id" = ${sessionId}
                FOR UPDATE
            `;

            const session = lockedSessions[0];
            if (!session) {
                throw new Error("Session not found")
            }

            const [child, existingEnrollment, enrollmentCount] = await Promise.all([
                tx.child.findFirst({
                    where: { id: childId, parentId: user.id }
                }),
                tx.enrollment.findFirst({
                    where: { sessionId, childId }
                }),
                tx.enrollment.count({
                    where: { sessionId }
                })
            ])

            const blockReason = getEnrollmentBlockReason({
                isParent,
                sessionInParentOrg: parentOrgIds.has(session.organizationId),
                childBelongsToParent: Boolean(child),
                sessionStartsAt: session.startsAt,
                now: new Date(),
                capacity: session.capacity,
                enrollmentCount,
                alreadyEnrolled: Boolean(existingEnrollment),
            })

            if (blockReason) {
                throw new Error(blockReason)
            }

            await tx.enrollment.create({
                data: { sessionId, childId }
            })
        })
    } catch (error) {
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Enrollment failed"
        }
    }

    revalidatePath("/sessions");
    return {
        ok: true,
        message: "Enrolled successfully"
    }
}
