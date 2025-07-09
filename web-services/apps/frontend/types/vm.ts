export interface VM {
    id: string;
    name: string;
    status: "RUNNING" | "TERMINATING" | "STOPPED" | "BOOTING";
    region: string;
    os: string;
    cpu: string;
    diskSize: string;
    price: string;
    createdAt: string;
    instanceId: string;
    ipAddress: string;
    endTime: Date;
    sshEnabled: true;
}