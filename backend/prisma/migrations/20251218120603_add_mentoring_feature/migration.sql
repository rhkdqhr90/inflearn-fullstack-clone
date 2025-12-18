-- CreateEnum
CREATE TYPE "MentoringApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "mentorings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "company" TEXT,
    "price_per_session" INTEGER NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "session_duration" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_schedules" (
    "id" TEXT NOT NULL,
    "mentoring_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "mentoring_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_applications" (
    "id" TEXT NOT NULL,
    "mentoring_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MentoringApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentoring_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentorings_userId_key" ON "mentorings"("userId");

-- CreateIndex
CREATE INDEX "mentorings_userId_idx" ON "mentorings"("userId");

-- CreateIndex
CREATE INDEX "mentorings_is_active_idx" ON "mentorings"("is_active");

-- CreateIndex
CREATE INDEX "mentoring_schedules_mentoring_id_idx" ON "mentoring_schedules"("mentoring_id");

-- CreateIndex
CREATE INDEX "mentoring_schedules_day_of_week_idx" ON "mentoring_schedules"("day_of_week");

-- CreateIndex
CREATE INDEX "mentoring_applications_mentoring_id_idx" ON "mentoring_applications"("mentoring_id");

-- CreateIndex
CREATE INDEX "mentoring_applications_applicant_id_idx" ON "mentoring_applications"("applicant_id");

-- CreateIndex
CREATE INDEX "mentoring_applications_status_idx" ON "mentoring_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_applications_mentoring_id_applicant_id_scheduled__key" ON "mentoring_applications"("mentoring_id", "applicant_id", "scheduled_date");

-- AddForeignKey
ALTER TABLE "mentorings" ADD CONSTRAINT "mentorings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_schedules" ADD CONSTRAINT "mentoring_schedules_mentoring_id_fkey" FOREIGN KEY ("mentoring_id") REFERENCES "mentorings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_applications" ADD CONSTRAINT "mentoring_applications_mentoring_id_fkey" FOREIGN KEY ("mentoring_id") REFERENCES "mentorings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_applications" ADD CONSTRAINT "mentoring_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
