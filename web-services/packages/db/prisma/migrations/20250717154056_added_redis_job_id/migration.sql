/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `VMInstance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `VMInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VMInstance" ADD COLUMN     "jobId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VMInstance_jobId_key" ON "VMInstance"("jobId");
