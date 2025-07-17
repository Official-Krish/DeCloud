/*
  Warnings:

  - You are about to drop the column `PaymnentType` on the `VMInstance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VMInstance" DROP COLUMN "PaymnentType",
ADD COLUMN     "PaymentType" "PaymnentType" NOT NULL DEFAULT 'DURATION';
