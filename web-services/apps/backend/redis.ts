import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
});

export const vmQueue = new Queue("vm-termination", {
    connection
})

export const DepinVerificationQueue = new Queue("vm-verification", {
    connection
});

export const changeStatus = new Queue("changeVMSatus", {
    connection
})

export const depinVMQueue = new Queue("terminate-depin-vm", {
    connection
});