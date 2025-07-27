require("dotenv").config();
import { Router } from "express";
import { DepinVerificationSchema } from "@decloud/types";
import prisma from "@decloud/db";
import { deActivateHost, initialiseAccount } from "../redis";
import { calculatePricePerHour } from "../utils/calculatePrice";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const depinRouter = Router();

depinRouter.post("/depinVerification", async (req, res) => {
    const parseData = DepinVerificationSchema.safeParse(req.body);
    if (!parseData.success) {
        res.status(400).json({ error: parseData.error.errors });
        return;
    }
    try {      
        const { os, cpu_cores, ram_gb, disk_gb, ip_address, wallet, Key } = parseData.data;
        const user = await prisma.user.findFirst({
            where: {
                publicKey: wallet,
            }
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const vm = await prisma.depinHostMachine.findFirst({
            where: {
                ipAddress: ip_address,
            }
        })
        if (!vm) {
            res.status(404).json({ error: "VM not found" });
            return;
        }
        const isKeyValid = await bcrypt.compare(Key, vm.Key);
        if (!isKeyValid) {
            res.status(400).json({ error: "Invalid Key" });
            return;
        }
        // check vm details
        if (vm.os !== os || vm.cpu !== cpu_cores || vm.ram !== ram_gb || vm.diskSize !== disk_gb) {
            await prisma.depinHostMachine.delete({
                where: { id: vm.id },
            });
            res.status(400).json({ error: "VM details do not match" });
            return;
        }
        await prisma.depinHostMachine.update({
            where: { id: vm.id },
            data: {
                verified: true,
            }
        });
        const pricePerHour = calculatePricePerHour(cpu_cores, ram_gb, disk_gb);

        initialiseAccount.add("initialise-host-pda", {
            id: vm.id,
            hostName: user.name,
            machineType: vm.machineType,
            os: vm.os,
            diskSize: vm.diskSize,
            pricePerHour: pricePerHour,
            userPubKey: wallet,
        });
        const token = jwt.sign({
            id: vm.id,
            userPublicKey: wallet,
        }, process.env.JWT_SECRET || "default_secret");
        res.status(200).json({ message: "VM verified successfully", 
            host_id: vm.id, 
            token 
        });

    } catch (error) {
        console.error("Error in depin verification:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});

depinRouter.post("/depin/changeStatus", async (req, res) => {
    const { ipAddress, token, status } = req.body;
    if (!ipAddress || !token) {
        res.status(400).json({ error: "IP Address and Token are required" });
        return;
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id || !decodedToken.userPublicKey) {
        res.status(401).json({ error: "Invalid token" });
        return;
    }
    try {
        const vm = await prisma.depinHostMachine.findFirst({
            where: {
                ipAddress: ipAddress,
            }
        });
        if (!vm) {
            res.status(404).json({ error: "VM not found" });
            return;
        }
        if (!vm.isActive) {
            res.status(400).json({ error: "VM is already inactive" });
            return;
        }
        await prisma.depinHostMachine.update({
            where: { id: vm.id },
            data: {
                isActive: status,
            }
        });
        // Add job to deactivate host
        deActivateHost.add("changeVMSatus", {
            id: vm.id,
            userPubKey: vm.userPublicKey,
            status: status,
        });
        console.log(`VM status changed to ${status} for IP: ${ipAddress}`);
        res.status(200).json({ message: "VM deactivated successfully" });
    } catch (error) {
        console.error("Error in deactivating VM:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default depinRouter;