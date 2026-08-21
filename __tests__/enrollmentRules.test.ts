import { expect, test } from "vitest";
import { getEnrollmentBlockReason } from "@/app/lib/enrollmentRules";

test("rejects enrolment when the session is at capacity", () => {
  const reason = getEnrollmentBlockReason({
    isParent: true,
    sessionInParentOrg: true,
    childBelongsToParent: true,
    sessionStartsAt: new Date("2099-01-01T10:00:00.000Z"),
    now: new Date("2026-01-01T10:00:00.000Z"),
    capacity: 2,
    enrollmentCount: 2,
    alreadyEnrolled: false,
  });

  expect(reason).toBe("This session is full.");
});

test("allows enrolment when seats remain", () => {
  const reason = getEnrollmentBlockReason({
    isParent: true,
    sessionInParentOrg: true,
    childBelongsToParent: true,
    sessionStartsAt: new Date("2099-01-01T10:00:00.000Z"),
    now: new Date("2026-01-01T10:00:00.000Z"),
    capacity: 2,
    enrollmentCount: 1,
    alreadyEnrolled: false,
  });

  expect(reason).toBeNull();
});
