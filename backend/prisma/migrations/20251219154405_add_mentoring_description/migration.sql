/*
  Warnings:

  - Added the required column `title` to the `mentorings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mentorings" ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL;
