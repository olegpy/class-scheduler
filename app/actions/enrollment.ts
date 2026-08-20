import {getCurrentUser} from "@/app/lib/auth";
import {db} from "@/app/lib/db";

export type EnrollState  ={
    ok: boolean;
    messages: string;
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
            message: "Please select asigned-in user"
        }
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            await db.$transaction(
                async (tx) => {
                    const lockedSessions = tx.$queryRaw<Array<{
                        id: string;
                        organisationId: string;
                        startsAt: Date;
                        capacity: number
                    }>>`
                        SELECT "id", "organisationId", "startsAt", "capacity" 
                        FROM "ClassSession"
                        WHERE "id" = ${sessionId}
                        FOR UPDATE
                    `;

                    const session = lockedSessions[0];
                    if (!session) {
                        throw new Error("Session not found")
                    }

                    const [membership, child, existingEnrollment, enrollmentCount] = await Promise.all([
                        tx.membership.findFirst({
                            where: {
                                userId: user.id,
                                organizationId: session.organizationId,
                                role: "PARENT"
                            }
                        }),
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

                    await tx.enrollment.create({
                        data: { sessionId, childId }
                    })
                }
            )
        } catch (error) {
            return {
                ok: false,
                message: error instanceof Error ? error.message: "Enrollment failed"
            }
        }
    }

    return {
        ok: false,
        message: "Enrollemnt failed, Please try again"
    }
}