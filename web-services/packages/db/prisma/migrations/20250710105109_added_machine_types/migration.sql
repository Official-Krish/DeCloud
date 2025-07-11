/*
  Warnings:

  - You are about to drop the column `cpu` on the `VMConfig` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VMConfig` table. All the data in the column will be lost.
  - Added the required column `machineType` to the `VMConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "VMProvider" ADD VALUE 'LOCAL';

-- AlterTable
ALTER TABLE "VMConfig" DROP COLUMN "cpu",
DROP COLUMN "updatedAt",
ADD COLUMN     "machineType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VMInstance" ALTER COLUMN "status" SET DEFAULT 'BOOTING';

-- CreateTable
CREATE TABLE "VMTypes" (
    "id" TEXT NOT NULL,
    "machineType" TEXT NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "priceMonthlyUSD" DOUBLE PRECISION NOT NULL,
    "description" TEXT,

    CONSTRAINT "VMTypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VMTypes_machineType_key" ON "VMTypes"("machineType");
