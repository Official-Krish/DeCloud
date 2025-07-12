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
    machineType?: string;
}

export interface VMTypes {
    id: string      
    machineType: string      
    cpu: Number
    ram: Number
    description: string
}

export interface FinalConfig {
    vmId: string;
    instanceId: string;
    ipAddress: string;
    privateKey: string;
}