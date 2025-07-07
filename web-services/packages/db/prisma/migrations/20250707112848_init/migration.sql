-- CreateEnum
CREATE TYPE "VMStatus" AS ENUM ('STARTING', 'RUNNING', 'STOPPED', 'TERMINATED', 'FAILED', 'BILLING_PENDING');

-- CreateEnum
CREATE TYPE "VMProvider" AS ENUM ('AWS', 'AZURE', 'GCP', 'DIGITALOCEAN', 'VULTR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VMInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "VMStatus" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'asia-south-2c',
    "provider" "VMProvider" NOT NULL,
    "instanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VMInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VMConfig" (
    "id" TEXT NOT NULL,
    "vmId" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "cpu" DOUBLE PRECISION NOT NULL,
    "memory" DOUBLE PRECISION NOT NULL,
    "diskSize" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VMConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicKey_key" ON "User"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "VMConfig_vmId_key" ON "VMConfig"("vmId");

-- AddForeignKey
ALTER TABLE "VMInstance" ADD CONSTRAINT "VMInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VMConfig" ADD CONSTRAINT "VMConfig_vmId_fkey" FOREIGN KEY ("vmId") REFERENCES "VMInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
