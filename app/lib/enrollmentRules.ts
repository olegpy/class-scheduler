export type EnrollmentCheckInput = {
    isParent: boolean;
    sessionInParentOrg: boolean;
    childBelongsToParent: boolean;
    sessionStartsAt: Date;
    now: Date;
    capacity: number;
    enrollmentCount: number;
    alreadyEnrolled: boolean;
};

export function getEnrollmentBlockReason(
    input: EnrollmentCheckInput
): string | null {
    if (!input.isParent) {
        return "Only parents can enrol children.";
    }
    if (!input.childBelongsToParent) {
        return "You can only enrol your own children.";
    }
    if (!input.sessionInParentOrg) {
        return "You can only enrol into sessions in your organization.";
    }
    if (input.sessionStartsAt <= input.now) {
        return "You can only enrol into future sessions.";
    }
    if (input.alreadyEnrolled) {
        return "This child is already enrolled in this session.";
    }
    if (input.enrollmentCount >= input.capacity) {
        return "This session is full.";
    }
    return null;
}
