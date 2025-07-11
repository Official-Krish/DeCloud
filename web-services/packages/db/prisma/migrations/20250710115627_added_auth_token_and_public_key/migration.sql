/*
  Warnings:

  - Added the required column `AuthToken` to the `VMInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `VMInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VMInstance" ADD COLUMN     "AuthToken" TEXT NOT NULL,
ADD COLUMN     "publicKey" TEXT NOT NULL;
