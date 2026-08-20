import {enrollChild, EnrollState} from "@/app/actions/enrollment";
import {Child} from "@/app/generated/prisma/client";
import {useActionState} from "react";

const initialState: EnrollState = { ok: false, message: '' }

export function EnrolmentForm({
    sessionId,
    children,
    disabled,
    disabledReason}: {
    sessionId: string;
    children: Child[]
    disabled?: boolean;
    disabledReason?: string
}) {
    const [state, formAction, pending] = useActionState(enrollChild, initialState);


    return (
        <div>
            <form action={formAction}>

            </form>
        </div>
    )
}



