/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `VMInstance` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "VMInstance" DROP COLUMN "updatedAt";
