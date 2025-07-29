/*
  Warnings:

  - Added the required column `os` to the `VMImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VMImage" DROP CONSTRAINT "VMImage_depinHostMachineId_fkey";

-- AlterTable
ALTER TABLE "VMImage" ADD COLUMN     "applicationPort" INTEGER,
ADD COLUMN     "applicationUrl" TEXT,
ADD COLUMN     "os" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "VMImage" ADD CONSTRAINT "VMImage_depinHostMachineId_fkey" FOREIGN KEY ("depinHostMachineId") REFERENCES "DepinHostMachine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
