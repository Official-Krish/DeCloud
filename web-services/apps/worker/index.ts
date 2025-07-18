import { Worker } from "bullmq";
import IORedis from "ioredis";
import compute from '@google-cloud/compute';
import prisma  from "@decloud/db";
import { endRentalSession } from "./contract";

const projectId = process.env.PROJECT_ID;

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker("vm-termination", async job => {
    console.log(`Processing job ${job.id} for VM instance with ID ${job.data.vmId}`);
    try {
        const { instanceId, zone, pubKey, isEscrow, id } = job.data;
        const vmInstance = await prisma.vMInstance.findFirst({
            where: {
                id: id,
                instanceId: instanceId,
            },
        });
        if (!vmInstance) {
            return;
        }
        await endRentalSession(vmInstance.id, pubKey, isEscrow);
        const operationDone = await deleteInstance(zone, instanceId);
        if (!operationDone) {
            console.error(`Failed to delete VM instance with ID ${instanceId}`);
            return;
        }
        await prisma.vMInstance.update({
            where: {
                id: id,
                instanceId: instanceId,
            },
            data: {
                status: "DELETED",
            }
        });
        console.log(`VM instance with ID ${instanceId} deleted and rental session ended successfully.`);
    } catch (error) {
        console.error(`Error processing job ${job.data.vmId}:`, error);
    }
}, {
  connection,
});

async function deleteInstance(zone: string, instanceId: string) {
    const instancesClient = new compute.InstancesClient();
  
    const [response] = await instancesClient.delete({
        project: projectId,
        zone,
        instance: instanceId,
    });
    
    await response.promise();
    return true;
}

worker.on("completed", (job) => {
    console.log(`Job completed successfully: ${job.data.instanceId}`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});