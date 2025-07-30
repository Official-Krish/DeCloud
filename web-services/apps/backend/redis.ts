import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
});

export const vmQueue = new Queue("vm-termination", {
    connection
})

export const terminateDepinVMQueue = new Queue("terminate-depin-vm", {
    connection
});

export const activateHostQueue = new Queue("changeVMStatus", {
    connection
});