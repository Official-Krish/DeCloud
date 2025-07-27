/*
  Warnings:

  - Added the required column `Key` to the `DepinHostMachine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DepinHostMachine" ADD COLUMN     "Key" TEXT NOT NULL;
