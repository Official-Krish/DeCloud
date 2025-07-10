
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { type VM } from "../../types/vm";

export function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [vms, setVMs] = useState<VM[]>([]);

    useEffect(() => {
        const getVMs = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/vmInstnace/getAll`);
                setVMs(res.data.vms);
            } catch (error) {
                console.error("Error fetching VMs:", error);    
            }
        }
        getVMs();
    }, []);

    const deleteVM = async (id: string, instanceId: string, zone: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/vmInstnace/destroy/vmId=${id}&instanceId=${instanceId}&zone=${zone}`);
            setVMs(vms.filter(vm => vm.id !== id));
        } catch (error) {
            console.error("Error deleting VM:", error);
        }
    };

    const filteredVMs = vms.filter(vm => {
        const matchesSearch = vm.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || vm.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">Virtual Machines</h1>
                    <p className="text-muted-foreground">Manage your cloud compute instances</p>
                </div>
                
                <Link to="/rent">
                    <Button className="mt-4 sm:mt-0 cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        New VM
                    </Button>
                </Link>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search VMs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                <div className="flex gap-2">
                    {["all", "running", "stopped", "booting"].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(status)}
                            className="capitalize cursor-pointer"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* VM List */}
            <div className="space-y-4">
                {filteredVMs.map((vm, index) => (
                    <motion.div
                        key={vm.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-poiner"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = `/vm/${vm.id}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-4 mb-3">
                                    <Link 
                                        to={`/vm/${vm.id}`}
                                        className="text-lg font-semibold truncate hover:text-primary transition-colors"
                                    >
                                        {vm.name}
                                    </Link>
                                    <StatusBadge status={vm.status} />
                                    <Link to={`/vm/${vm.id}`}>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                    <div>
                                        <span className="block font-medium text-foreground">{vm.region}</span>
                                        <span>Region</span>
                                    </div>
                                    <div>
                                        <span className="block font-medium text-foreground">{vm.os}</span>
                                        <span>Operating System</span>
                                    </div>
                                    <div>
                                        <span className="block font-medium text-foreground">{vm.cpu} • {vm.diskSize}</span>
                                        <span>Resources</span>
                                    </div>
                                    <div>
                                        <span className="block font-medium text-foreground font-mono">{vm.price}</span>
                                        <span>Rented for</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="outline" size="sm"  className="cursor-pointer"
                                    onClick={() => deleteVM(vm.id, vm.instanceId, vm.region)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-sm text-muted-foreground">
                            <span>Created {vm.createdAt}</span>
                            <span className="font-mono">ID: {vm.id}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredVMs.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <div className="text-muted-foreground mb-4">
                        {searchQuery || filter !== "all" ? "No VMs match your criteria" : "No VMs created yet"}
                    </div>
                    <Link to="/rent">
                        <Button className="cursor-pointer">Create your first VM</Button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}