"use client";

import {useActionState} from "react";
import {enrollChild, type EnrollState} from "@/app/actions/enrollment";

const initialState: EnrollState = { ok: false, message: '' }

type EnrollmentChild = {
    id: string;
    name: string;
};

export function EnrollmentForm({
    sessionId,
    availableChildren,
    disabled,
    disabledReason}: {
    sessionId: string;
    availableChildren: EnrollmentChild[];
    disabled?: boolean;
    disabledReason?: string
}) {
    const [state, formAction, pending] = useActionState(enrollChild, initialState);
    const cannotEnrol = Boolean(disabled) || availableChildren.length === 0;

    if (cannotEnrol) {
        return <p>{disabledReason ?? "No children available to enrol."}</p>
    }

    return (
        <form action={formAction}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <label>
                Child{" "}
                <select name="childId" required defaultValue="">
                    <option value="" disabled>Select a child</option>
                    {availableChildren.map((child) => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                </select>
            </label>
            {" "}
            <button type="submit" disabled={pending}>
                {pending ? "Enrolling…" : "Enrol"}
            </button>
            {state.message ? <p>{state.message}</p> : null}
        </form>
    )
}
