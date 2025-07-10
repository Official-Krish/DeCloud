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

export interface VmTypes {
    
}

export interface FinalConfig {
    vmId: string;
    instanceId: string;
    ipAddress: string;
    privateKey: string;
}