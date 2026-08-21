import {cookies} from "next/headers";
import {db} from "@/app/lib/db";

const USER_COOKIE = "demo-user-id";

export async function getCurrentUserId() {
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get(USER_COOKIE)?.value;
    // Prefer .env so CURRENT_USER_ID always wins when set
    return process.env.CURRENT_USER_ID || cookieUserId || null;
}

export async function getCurrentUser() {
    const userId = await getCurrentUserId();

    if (userId) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                memberships: {
                    include: { organization: true }
                },
                children:true
            }
        })

        if (user) return user;
    }

    return db.user.findFirst({
        orderBy: { email: "asc" },
        include: {
            memberships: {
                include: { organization: true }
            },
            children:true
        }
    })
}