import prisma from "@decloud/db";
import { Router } from "express";
import axios from "axios";

const vm = Router();

vm.get("/calculatePrice", async (req, res) => {
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
        const price = (totalPrice / (solPrice * 30 * 24));
        res.status(200).json({ price: price});
    } catch (error) {
        console.error("Error calculating price:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

vm.get("/getVMTypes", async (req, res) => {
    try {
        const vmTypes = await prisma.vMTypes.findMany();
        res.status(200).json(vmTypes);
    } catch (error) {
        console.error("Error fetching VM types:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default vm;

async function getSolPrice() {
    const res = await axios.get("https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112");
    return (Number(res.data.So11111111111111111111111111111111111111112.usdPrice));
}