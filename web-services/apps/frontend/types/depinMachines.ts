export interface Machine {
    id: string;
    machineType: string;
    region: string;
    isActive: boolean;
    cpu: number;
    ram: number;
    storage: number;
    earnings: number;
    ipAddress: string;
}