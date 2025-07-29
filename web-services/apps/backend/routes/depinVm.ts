import { Router } from "express";
import { authMiddleware } from "../utils/middleware";
import prisma from "@decloud/db";
import { DepinDeployImageSchema } from "@decloud/types";
import { depinVMQueue } from "../redis";

const depinVM = Router();

depinVM.post("/deployImage", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });
    if (!user) {
        res.status(404).json({
            error: "User not found",
        });
        return;
    }
    const parseData = DepinDeployImageSchema.safeParse(req.body);
    if (!parseData.success) {
        res.status(400).json({
            error: "Invalid request body",
        });
        return;
    }
    try {
        const { appName, dockerImage, cpu, ram, diskSize, ports, envVars, endTime } = parseData.data;
        const findVm = await prisma.depinHostMachine.findFirst({
            where: {
                isActive: true,
                cpu: {
                    gte: parseInt(cpu),
                },
                ram: {
                    gte: parseInt(ram), 
                }
            },
        });
        if (!findVm) {
            res.status(404).json({
                error: "No suitable VM found for deployment",
            });
            return;
        }

        // TODO: Send deployment request to the VM provider

        const txn = await prisma.$transaction(async (tx) => {
            await prisma.depinHostMachine.update({
                where: {
                    id: findVm.id,
                },
                data: {
                    isOccupied: true,
                },
            });

            const job = await depinVMQueue.add("terminate-depin-vm", { 
                zone: findVm.region,
                pubKey: user.publicKey,
                id: findVm.id,
            }, {
                delay: 10 * 60 * 1000,
            });

            await prisma.vMInstance.create({
                data: {
                    name: appName,
                    userId: userId!,
                    jobId: job.id || findVm.id,
                    status: "DEPLOYING",
                    PaymentType: "ESCROW",
                    region: findVm.region,
                    ipAddress: findVm.ipAddress,
                    endTime: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
                    provider: "LOCAL",
                    price: 0,
                    startTime: new Date(),
                }
            });

            await prisma.vMImage.create({
                data: {
                    name: appName,
                    description: "",
                    dockerImage: dockerImage,
                    cpu: parseInt(cpu),
                    ram: parseInt(ram),
                    diskSize: parseInt(diskSize),
                    depinHostMachineId: findVm.id,
                    os: findVm.os
                }
            });
        });

        res.status(200).json({
            message: "Deployment request sent successfully",
            vmId: findVm.id,
        });

    } catch (error) {
        console.error("Error deploying image:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});

depinVM.delete("/terminate/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });
    if (!user) {    
        res.status(404).json({
            error: "User not found",
        });
        return;
    }
    const vmId = req.params.id;
    const vmInstance = await prisma.vMInstance.findFirst({
        where: {
            id: vmId,
            userId: userId,
        },
    });
    if (!vmInstance) {
        res.status(404).json({
            error: "VM instance not found",
        });
        return;
    }
    try {
        // TODO: Add logic to send termination request to the VM provider
        const txn = await prisma.$transaction(async (tx) => {
            await prisma.vMInstance.update({
                where: {
                    id: vmId,
                },
                data: {
                    status: "TERMINATED",
                },
            });
            await prisma.depinHostMachine.update({
                where: {
                    id: vmInstance.id,
                },
                data: {
                    isOccupied: false,
                },
            });
        });

        res.status(200).json({
            message: "Termination request sent successfully",
        });
    } catch (error) {
        console.error("Error terminating VM:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});

export default depinVM;