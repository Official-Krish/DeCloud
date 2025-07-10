/*
  Warnings:

  - You are about to drop the column `pricePerHour` on the `VMTypes` table. All the data in the column will be lost.
  - Added the required column `priceMonthlyUSD` to the `VMTypes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VMTypes" DROP COLUMN "pricePerHour",
ADD COLUMN     "priceMonthlyUSD" DOUBLE PRECISION NOT NULL;
