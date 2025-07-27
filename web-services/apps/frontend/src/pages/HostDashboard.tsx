import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Plus, Settings, Eye, Power, PowerOff } from "lucide-react";
import { type Machine } from "../../types/depinMachines";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";

export function HostDashboard() {
    const wallet = useWallet();
    const [machines, setMachines] = useState<Machine[]>([]);

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/depin/getAll?userPublicKey=${wallet.publicKey}`, {
                    headers: {
                        "Authorization": `${localStorage.getItem("token")}`
                    },
                });
                if (res.status === 200) {
                    setMachines(res.data.machines);
                }
            } catch (error) {
                console.error("Error fetching machines:", error);
            }
        }   
        fetchMachines();
    }, []);

    const getStatusColor = (status: boolean) => {
        switch (status) {
            case true: return 'bg-emerald-500';
            case false: return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusBadge = (status: boolean) => {
        switch (status) {
            case true: return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Running</Badge>;
        
            case false: return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Maintenance</Badge>;
            default: return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    if (!wallet || !localStorage.getItem("token")) {
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
              >
                  <h1 className="text-3xl font-bold mb-4">Please SignIn</h1>
                  <p className="text-muted-foreground mb-6">Please connect your wallet and signInto manage your virtual machines.</p>
                  <Link to="/signin">
                      <Button className="cursor-pointer">SignIn</Button>
                  </Link>
              </motion.div>
          </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Host <span className="gradient-text">Dashboard</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Manage your DePIN compute nodes and track earnings
                        </p>
                    </div>
                    <Button 
                        className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                        onClick={() => window.location.href = '/depin/hostVm'}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Machine
                    </Button>
                </div>
            </motion.div>


            {/* Machines Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
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
                                <TableHead>Machine</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Specs</TableHead>
                                <TableHead>Earnings</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {machines.map((machine, index) => (
                                    <motion.tr
                                        key={machine.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="group hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.isActive)}`} />
                                                {getStatusBadge(machine.isActive)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm space-y-1">
                                                <div>{machine.cpu} CPU • {machine.ram}GB RAM</div>
                                                <div className="text-muted-foreground">{machine.storage}GB Storage • {machine.region}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-emerald-600">
                                                {machine.earnings.toFixed(1)} SOL
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/machine/${machine.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    {machine.isActive ? 
                                                        <PowerOff className="h-4 w-4 text-red-500" />
                                                    : 
                                                        <Power className="h-4 w-4 text-green-500" />
                                                    }
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}