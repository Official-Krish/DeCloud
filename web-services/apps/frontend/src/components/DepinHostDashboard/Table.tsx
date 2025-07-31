import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Power, PowerOff, Server } from "lucide-react";
import type { Machine } from "types/depinMachines";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { DEPIN_WORKER } from "@/config";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../ui/dialog";
import { Input } from "../ui/input";
import Tooltip from "../Tooltip";
import { claimSolana, getEarnedSOL } from "@/lib/depin";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { CodeBlock } from "../DepinHosting/CodeBlock";
import { onboardingScript } from "../DepinHosting/constants/scripts";

export const DashboardTable = ({ machines, setMachines }: { machines: Machine[], setMachines: (machines: Machine[]) => void }) => {
    const wallet = useAnchorWallet();
    const [key, setKey] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<{ id: string, isActive: boolean } | null>(null);
    const getStatusColor = (status: boolean) => {
        switch (status) {
            case true: return 'bg-emerald-500';
            case false: return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusBadge = (status: boolean) => {
        switch (status) {
            case true: return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">True</Badge>;
        
            case false: return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">False</Badge>;
            default: return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const changeMachineStatus = async (machineId: string, isActive: boolean) => {
        if (key === "") {
            toast.error("Please enter your key to change machine status");
            return;
        }
        try {
            const res = await axios.post(`${DEPIN_WORKER}/depin/changeVisibility`, {
                id: machineId,
                pubKey: wallet?.publicKey?.toBase58(),
                status: !isActive,
                Key: key,
            }, {
                headers: {
                    "Authorization": `${localStorage.getItem("token")}` 
                },
            });
            if (res.status === 200) {
                toast.success(`Machine ${!isActive ? "activated" : "deactivated"} successfully`);
                setDialogOpen(false);
                setKey("");
                const updatedMachines = machines.map(machine =>
                    machine.id === machineId ? { ...machine, isActive: !isActive } : machine
                );
                setMachines(updatedMachines);
            }
        } catch (error) {
            console.error("Error changing machine status:", error);
            toast.error("Failed to change machine status. Please try again.");
        }
    }

    const handleClaimSOL = async (machineId: string) => {
        try {
            const amount = await getEarnedSOL(machineId, wallet?.publicKey!, wallet!);
            const txn = await claimSolana(wallet!, machineId);
            if (!txn){
                toast.error("Failed to claim SOL. Please try again.");
                return;
            }
            const res = await axios.post(`${DEPIN_WORKER}/depin/claimSol`, {
                id: machineId,
                pubKey: wallet?.publicKey?.toBase58(),
                amount: amount, 
                Key: key,
            }, {
                headers: {
                    "Authorization": `${localStorage.getItem("token")}`
                },
            });
            if (res.status === 200) {
                toast.success("SOL claimed successfully");
                const updatedMachines = machines.map(machine =>
                    machine.id === machineId ? { ...machine, claimedSOL: machine.claimedSOL + 1 } : machine
                );
                setMachines(updatedMachines);
            } 
        } catch (error) {
            console.error("Error claiming SOL:", error);
            toast.error("Failed to claim SOL. Please try again.");
        }
    }
    return (
        <div>
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Server className="h-5 w-5" />
                        <span>Your Machines</span>
                    </CardTitle>
                    <CardDescription>
                        Monitor and manage all your registered compute nodes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Ip Address</TableHead>
                            <TableHead>Occupied</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Specs</TableHead>
                            <TableHead>Earnings</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {machines.map((machine, index) => (
                                <motion.tr
                                    key={machine.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">{machine.ipAddress}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(machine.isOccupied)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`w-2 h-2 rounded-full items-center ${getStatusColor(machine.isActive)}`} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-1">
                                            <div>{machine.cpu} CPU • {machine.ram}GB RAM</div>
                                            <div className="text-muted-foreground">{machine.diskSize}GB Storage • {machine.region}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-emerald-600">
                                            {machine.claimedSOL} SOL
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="cursor-pointer"
                                                onClick={() => window.location.href = `depin/machine/${machine.id}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedMachine({ id: machine.id, isActive: machine.isActive });
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                {machine.isActive ? 
                                                    <Tooltip Icon={PowerOff } description="Turn Off Machine" className="h-4 w-4 text-red-500"/>
                                                    : 
                                                    <Tooltip Icon={Power} description="Turn On Machine" className="h-4 w-4 text-green-500"/>
                                                }
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button className="bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
                                            onClick={() => {
                                                handleClaimSOL(machine.id);
                                            }}
                                        >
                                            Claim SOL
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Authorization Key</DialogTitle>
                        <DialogDescription>
                            Please enter your authorization key to turn the machine {selectedMachine?.isActive ? "off" : "on"}.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        type="password"
                        className="w-full border rounded px-3 py-2 mt-4 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Authorization Key"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                    />
                    {!selectedMachine?.isActive && 
                        <div className="max-w-md mx-auto mb-4 text-sm text-gray-600">
                            Run this script to turn on your machine:
                            <CodeBlock script={onboardingScript} />
                        </div>
                    }
                    <DialogFooter>
                        <Button
                            className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition cursor-pointer"
                            onClick={() => changeMachineStatus(selectedMachine?.id || "", selectedMachine?.isActive || false)}
                        >
                            Submit
                        </Button>
                        <DialogClose asChild>
                            <Button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}