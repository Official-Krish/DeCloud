require("dotenv").config();
import { Router } from "express";
import { authMiddleware } from "../utils/middleware";
import { VmInstanceSchema } from "@decloud/types";
import prisma from "@decloud/db";
import { InstancesClient } from "@google-cloud/compute";

const vmInstance = Router();
const projectId = process.env.PROJECT_ID;
const instanceClient = new InstancesClient();
const userId = "123";

vmInstance.post("/create", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({
            error: "User ID is required",
        });
        return;
    }
    const parsedBody = VmInstanceSchema.safeParse(req.body);
    if (!parsedBody.success) {
        res.status(400).json({
            error: "Invalid request body",
        });
        return;
    }

    try {
        const { name, region, price, provider, os, cpu, disk } = parsedBody.data;

        const [operation] = await instanceClient.insert({
            project: projectId,
            zone: region,
            instanceResource: {
                name,
                machineType: `zones/${region}/machineTypes/${cpu}`, // Ensure cpu is a valid type like "e2-standard-4"
                disks: [
                    {
                        initializeParams: {
                            sourceImage: `projects/debian-cloud/global/images/family/${os}`,
                            diskSizeGb: disk,
                        },
                        boot: true,
                        autoDelete: true,
                    },
                ],
                networkInterfaces: [
                    {
                        network: "global/networks/default",
                    },
                ],
            },
        });

        const [response] = await operation.promise();
        const vmId = response.targetId as unknown as string;

        const vm = await prisma.vMInstance.create({
            data: {
                name,
                region,
                endTime: new Date(Date.now() + 3600000), // 1 hour later
                price,
                provider,
                startTime: new Date(),
                userId,
                instanceId: vmId,
                status: "STARTING"
            }
        });
        const vMConfig = await prisma.vMConfig.create({
            data: {
                os,
                cpu,
                diskSize: String(disk),
                vmId: vm.id,
            }
        });
        res.status(200).json({
            message: "VM instance created successfully",
            json: {
                vmId: vmId,
                vMConfigId: vMConfig.id,
            }
        });
    } catch (error) {
        console.error("Error during VM instance creation:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
})

vmInstance.get("/pollStatus", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({  
            error: "User ID is required",
        });
        return;
    }
    const vmId = req.query.vmId as string;
    const id = req.query.id as string;
    if (!vmId || !id) {
        res.status(400).json({
            error: `ID is required`,
        });
        return;
    }

    try {
        const vmInstance = await prisma.vMInstance.findUnique({
            where: {
                id,
                instanceId: vmId,
            },
        });
        if (!vmInstance) {
            res.status(404).json({
                error: "VM instance not found",
            });
            return;
        }
        const [instance] = await instanceClient.get({
            project: projectId,
            zone: vmInstance.region,
            instance: vmId,
        });

        const status = instance.status; 
        if (!status) {
            res.status(404).json({
                error: "VM instance not found",
            });
            return;
        }

        await prisma.vMInstance.update({
            where: {
                id,
                instanceId: vmId,
            },
            data: {
                status: status,
            }
        });
        res.status(200).json({
            vmId,
            status,
        });
    } catch(e) {
        console.error("Error during VM status polling:", e);
        res.status(500).json({
            error: "Internal server error",
        });
    }

});

vmInstance.delete("/", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {  
        res.status(400).json({
            error: "User ID is required",
        });
        return;
    }
    const vmId = req.query.vmId as string;
    const id = req.query.id as string;
    if (!vmId || !id) {
        res.status(400).json({
            error: "VM ID is required",
        });
        return;
    }

    try {
        const vmInstance = await prisma.vMInstance.findUnique({
            where: {
                id,
                instanceId: vmId,
            },
        });
        if (!vmInstance) {
            res.status(404).json({
                error: "VM instance not found",
            });
            return;
        }
        const [operation] = await instanceClient.delete({
            project: projectId,
            zone: vmInstance.region,
            instance: vmId,
        });

        await operation.promise();

        await prisma.vMInstance.update({
            where: {
                id,
                instanceId: vmId,
            },
            data: {
                status: "DELETED",
            }
        });

        res.status(200).json({
            message: "VM instance deleted successfully",
        });
    } catch (error) {
        console.error("Error during VM instance deletion:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});

export default vmInstance;