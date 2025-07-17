import z from "zod";

export const SignUpSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(50),
    publicKey: z.string(),
})

export const SignInSchema = z.object({
    email: z.string().email(),
    publicKey: z.string(),
})

export const VmInstanceSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(50),
    paymentType: z.enum(["DURATION", "ESCROW"]),
    price: z.number().positive(),
    region: z.enum(["asia-south2-c", "asia-south2-b", "us-central1-a", "europe-west1-b", "us-east1-b", "us-west1-a"]).default("asia-south2-c"),
    provider: z.enum(["AWS", "AZURE", "GCP", "DIGITALOCEAN", "VULTR"]),
    os: z.enum(["ubuntu-20.04", "ubuntu-22.04", "debian-11", "ubuntu-18.04", "debian-10", "centos-7"]).default("ubuntu-22.04"),
    machineType: z.enum(["e2-medium", "e2-small", "e2-micro", "e2-standard"]).default("e2-micro"),
    diskSize: z.string().default("20"),
    endTime: z.number(),
})

export const EscrowTopUpSchema = z.object({
    id: z.string(),
    instanceId: z.string(),
    amount: z.number().positive(),
    additionalEscrowDuration: z.number(),
})