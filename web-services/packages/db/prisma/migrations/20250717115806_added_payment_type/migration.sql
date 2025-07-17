-- CreateEnum
CREATE TYPE "PaymnentType" AS ENUM ('DURATION', 'ESCROW');

-- AlterTable
ALTER TABLE "VMInstance" ADD COLUMN     "PaymnentType" "PaymnentType" NOT NULL DEFAULT 'DURATION';
