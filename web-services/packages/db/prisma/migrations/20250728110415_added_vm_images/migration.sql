/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `VMInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "VMImage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dockerImage" TEXT NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "diskSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VMImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VMImage_name_key" ON "VMImage"("name");

-- CreateIndex
CREATE INDEX "VMImage_name_idx" ON "VMImage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VMInstance_userId_key" ON "VMInstance"("userId");

-- AddForeignKey
ALTER TABLE "VMImage" ADD CONSTRAINT "VMImage_id_fkey" FOREIGN KEY ("id") REFERENCES "VMInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
