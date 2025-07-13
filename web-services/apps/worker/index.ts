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
    try {
        const { vmId, instanceId, zone, pubKey } = job.data;
        const vmInstance = await prisma.vMInstance.findFirst({
            where: {
                id: vmId,
                instanceId: instanceId,
            },
        });
        if (!vmInstance) {
            return;
        }
        await endRentalSession(vmId, pubKey);
        const operationDone = await deleteInstance(zone, instanceId);
        if (!operationDone) {
            console.error(`Failed to delete VM instance with ID ${instanceId}`);
            return;
        }
        await prisma.vMInstance.delete({
            where: {
                id: vmId,
                instanceId: instanceId,
            },
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
    console.log(`Job completed successfully: ${job.data.vmId}`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});