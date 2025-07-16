export interface VM {
    id: string;
    name: string;
    status: "RUNNING" | "TERMINATING" | "DELETED" | "BOOTING";
    region: string;
    price: string;
    createdAt: string;
    instanceId: string;
    ipAddress: string;
    endTime: Date;
    sshEnabled: true;
    VMConfig: {
        os: string;
        machineType: string;
        diskSize: string;
    };
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
    AuthToken: string;
}