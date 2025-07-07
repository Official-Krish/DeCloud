import z from "zod";

export const SignUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    name: z.string().min(1).max(50),
})

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
})

export const VmInstanceSchema = z.object({
    endTime: z.date(),
    price: z.number().positive(),
    region: z.string().default("asia-south-2c"),
    provider: z.enum(["AWS", "AZURE", "GCP", "DIGITALOCEAN", "VULTR"]),
    os: z.string().default("ubuntu-20.04"),
    cpu: z.string().default("t2.micro"),
    memory: z.string().default("1GB"),
    disk: z.string().default("20GB"),
})