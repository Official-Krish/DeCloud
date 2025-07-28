/*
  Warnings:

  - A unique constraint covering the columns `[depinHostMachineId]` on the table `VMImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `depinHostMachineId` to the `VMImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VMImage" ADD COLUMN     "depinHostMachineId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VMImage_depinHostMachineId_key" ON "VMImage"("depinHostMachineId");

-- AddForeignKey
ALTER TABLE "VMImage" ADD CONSTRAINT "VMImage_depinHostMachineId_fkey" FOREIGN KEY ("depinHostMachineId") REFERENCES "DepinHostMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
