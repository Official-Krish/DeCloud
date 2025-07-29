import { Worker } from "bullmq";
import IORedis from "ioredis";
import compute from '@google-cloud/compute';
import prisma  from "@decloud/db";
import { activateHost, deActivateHost, endRentalSession, InitialiseHostPDA } from "./contract";

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

worker.on("completed", (job) => {
    console.log(`Job completed successfully: ${job.data.instanceId}`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});


const DepinWorker = new Worker ("initialise-host-pda", async job => {
    try {
        const { id, hostName, machineType, os, diskSize, pricePerHour, userPubKey } = job.data;
        const tx = await InitialiseHostPDA(id, hostName, machineType, os, diskSize, pricePerHour, userPubKey);
        console.log(`Host PDA initialised successfully for job ${job.id}:`, tx);
        await prisma.depinHostMachine.update({
            where: {
                id: id
            },
            data: {
                pdaAddress: tx.hostMachinePda.toBase58(),
            }
        })
    } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
    }
})

DepinWorker.on("completed", (job) => {
    console.log(`Depin job completed successfully: ${job.id}`);
});
DepinWorker.on("failed", (job, err) => {
    console.error(`Depin job ${job?.id} failed: ${err.message}`);
});

const deActivateWorker = new Worker("changeVMSatus", async job => {
    const { id, userPubKey, status } = job.data;
    try {
        status === false && await deActivateHost(id, userPubKey);
        status === true && await  activateHost(id, userPubKey);
    } catch (error) {
        console.error(`Error processing deactivation job ${job.id}:`, error);
    }
});

deActivateWorker.on("completed", (job) => {
    console.log(`Deactivation job completed successfully: ${job.id}`);
});
deActivateWorker.on("failed", (job, err) => {
    console.error(`Deactivation job ${job?.id} failed: ${err.message}`);
});

const terminateDepinVm = new Worker("terminate-depin-vm", async job => {
   const { zone, pubKey, id } = job.data; 

   try {
        const findVm = await prisma.depinHostMachine.findFirst({
            where: {            
                id: id,
            },
        });
        if (!findVm) {
            console.error(`No VM found with ID ${id}`);
            return;
        }

        //TODO: Send termination request to the VM provider
        await endRentalSession(findVm.id, pubKey, true);

    } catch (error) {
       console.error(`Error processing terminate depin VM job ${job.id}:`, error);
    }
});

terminateDepinVm.on("completed", (job) => {
    console.log(`Terminate depin VM job completed successfully: ${job.id}`);
});
terminateDepinVm.on("failed", (job, err) => {
    console.error(`Terminate depin VM job ${job?.id} failed: ${err.message}`);
});

async function deleteInstance(zone: string, instanceId: string) {
    const instancesClient = new compute.InstancesClient();
  
    await instancesClient.delete({
        project: projectId,
        zone,
        instance: instanceId,
    });
    
    return true;
}