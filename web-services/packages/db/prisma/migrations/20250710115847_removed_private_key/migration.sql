/*
  Warnings:

  - You are about to drop the column `AuthToken` on the `VMInstance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VMInstance" DROP COLUMN "AuthToken",
ALTER COLUMN "publicKey" DROP NOT NULL;
