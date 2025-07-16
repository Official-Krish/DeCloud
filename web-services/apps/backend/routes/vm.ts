require("dotenv").config();
import prisma from "@decloud/db";
import { Router } from "express";
import axios from "axios";
import { authMiddleware } from "../utils/middleware";

const vm = Router();

vm.get("/calculatePrice", authMiddleware, async (req, res) => {
    try {
        const machineType = req.query.machineType as string;
        const diskSize = parseInt(req.query.diskSize as string, 10);
        const basePrice = await prisma.vMTypes.findFirst({
            where: {
                machineType: machineType
            },
        });
        if (!basePrice) {
            return res.status(404).json({ error: "Machine type not found" });
        }
        const additionalCost = diskSize > 10 ? (diskSize - 10) * 0.12 : 0;
        const totalPrice = basePrice.priceMonthlyUSD + additionalCost;
        const solPrice = await getSolPrice();
        const price = (totalPrice / (solPrice)); // for 30 days
        res.status(200).json({ price: price});
    } catch (error) {
        console.error("Error calculating price:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

vm.get("/getVMTypes", authMiddleware, async (req, res) => {
    try {
        const vmTypes = await prisma.vMTypes.findMany();
        res.status(200).json(vmTypes);
    } catch (error) {
        console.error("Error fetching VM types:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

vm.get("/getAll", authMiddleware, async (req, res) => {
    const adminKey = req.query.adminKey as string;
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const vms = await prisma.vMInstance.findMany({
            include: {
                VMConfig: true
            },
        });
        if (!vms || vms.length === 0) {
            res.status(200).json([]);
            return;
        }
        res.status(200).json(vms);
    } catch (error) {
        console.error("Error fetching VMs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

vm.get("/checkNameAvailability", authMiddleware, async (req, res) => {
    const name = req.query.name as string;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    try {
        const existingVM = await prisma.vMInstance.findFirst({
            where: {
                name: name,
                status: {
                    not: "DELETED"
                }
            },
        });
        if (existingVM) {
            return res.status(200).json({ available: false });
        }
        res.status(200).json({ available: true });
    } catch (error) {
        console.error("Error checking name availability:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default vm;

async function getSolPrice() {
    const res = await axios.get("https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112");
    return (Number(res.data.So11111111111111111111111111111111111111112.usdPrice));
}