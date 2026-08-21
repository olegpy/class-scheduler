-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_sessionId_childId_key" ON "Enrollment"("sessionId", "childId");
