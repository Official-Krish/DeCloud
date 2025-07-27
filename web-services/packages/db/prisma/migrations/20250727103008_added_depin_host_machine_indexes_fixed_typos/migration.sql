/*
  Warnings:

  - The `PaymentType` column on the `VMInstance` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DURATION', 'ESCROW');

-- DropForeignKey
ALTER TABLE "VMInstance" DROP CONSTRAINT "VMInstance_userId_fkey";

-- AlterTable
ALTER TABLE "VMInstance" DROP COLUMN "PaymentType",
ADD COLUMN     "PaymentType" "PaymentType" NOT NULL DEFAULT 'DURATION';

-- DropEnum
DROP TYPE "PaymnentType";

-- CreateTable
CREATE TABLE "DepinHostMachine" (
    "id" TEXT NOT NULL,
    "machineType" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "diskSize" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT NOT NULL,
    "userPublicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepinHostMachine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepinHostMachine_userPublicKey_key" ON "DepinHostMachine"("userPublicKey");

-- CreateIndex
CREATE INDEX "DepinHostMachine_machineType_idx" ON "DepinHostMachine"("machineType");

-- CreateIndex
CREATE INDEX "DepinHostMachine_region_idx" ON "DepinHostMachine"("region");

-- CreateIndex
CREATE INDEX "DepinHostMachine_isActive_idx" ON "DepinHostMachine"("isActive");

-- CreateIndex
CREATE INDEX "DepinHostMachine_verified_idx" ON "DepinHostMachine"("verified");

-- CreateIndex
CREATE INDEX "DepinHostMachine_userPublicKey_idx" ON "DepinHostMachine"("userPublicKey");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_publicKey_idx" ON "User"("publicKey");

-- CreateIndex
CREATE INDEX "VMInstance_userId_idx" ON "VMInstance"("userId");

-- CreateIndex
CREATE INDEX "VMInstance_status_idx" ON "VMInstance"("status");

-- CreateIndex
CREATE INDEX "VMInstance_provider_idx" ON "VMInstance"("provider");

-- CreateIndex
CREATE INDEX "VMInstance_region_idx" ON "VMInstance"("region");

-- CreateIndex
CREATE INDEX "VMInstance_startTime_endTime_idx" ON "VMInstance"("startTime", "endTime");

-- AddForeignKey
ALTER TABLE "VMInstance" ADD CONSTRAINT "VMInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepinHostMachine" ADD CONSTRAINT "DepinHostMachine_userPublicKey_fkey" FOREIGN KEY ("userPublicKey") REFERENCES "User"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;
