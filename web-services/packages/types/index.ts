import z from "zod";

export const SignUpSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(50),
    publicKey: z.string().min(32).max(64),
})

export const SignInSchema = z.object({
    email: z.string().email(),
    publicKey: z.string().min(32).max(64),
})

export const VmInstanceSchema = z.object({
    name: z.string().min(1).max(50),
    price: z.number().positive(),
    region: z.string().default("asia-south-2c"),
    provider: z.enum(["AWS", "AZURE", "GCP", "DIGITALOCEAN", "VULTR"]),
    os: z.string().default("ubuntu-20.04"),
    cpu: z.string().default("t2.micro"),
    disk: z.number().positive().default(20),
})