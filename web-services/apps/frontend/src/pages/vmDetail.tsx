
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  ArrowLeft, 
  Terminal, 
  Copy, 
  Trash2,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";
import { type VM } from "../../types/vm";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { toast } from "react-toastify";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { transferFromVault } from "@/lib/contract";
import { calculatePrice, getVmDetails } from "@/lib/vm";
import { formatter } from "@/lib/FormatTime";

export function VMDetails() {
  const wallet = useAnchorWallet();
  const { id } = useParams();
  const [vm, setVm] = useState<VM>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    const fetchVMDetails = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/vmInstance/getDetails?id=${id}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        setVm(response.data.vmInstance);
      } catch (error) {
        console.error("Error fetching VM details:", error);
      }
    };

    fetchVMDetails();
  },[])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
        const res = await axios.delete(`${BACKEND_URL}/vmInstance/destroy?vmId=${id}&instanceId=${vm?.instanceId}&zone=${vm?.region}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          if(res.data.remainingTime > 0) {
            const remainingPrice = await calculatePrice(vm?.VMConfig?.machineType!, Number(vm?.VMConfig?.diskSize), res.data.remainingTime);
            await transferFromVault(Number(remainingPrice), vm?.id as string, wallet!);
          }
          setLoading(false);
          toast.success("VM deleted successfully!", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          navigate("/dashboard");
        } else {
          setLoading(false);
          toast.error("Failed to delete VM", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        }
    } catch (error) {
        console.error("Error deleting VM:", error);
    }
  };

  if (!vm) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-muted-foreground">Loading VM details...</p>
      </div>
    );
  }

  if (vm.status === "DELETED") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-4">VM Deleted</h1>
          <p className="text-muted-foreground mb-6">This virtual machine has been deleted.</p>
          <Link to="/dashboard">
            <Button className="cursor-pointer">Back to Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/dashboard">
            <Button variant="outline" className="cursor-pointer" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">{vm.name}</h1>
            <StatusBadge status={vm.status} />
          </div>
          
          <div className="flex items-center space-x-2">
            
            <Button variant="destructive" size="sm" className={`cursor-pointer ${loading ? "opacity-50" : ""}`} 
              onClick={() => handleDelete()}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Deleting" : "Delete"}
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground mt-2">
          Instance ID: {vm.instanceId} • Created at: {formatter.format(new Date(vm.createdAt))}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Instance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-xs text-muted-foreground">Machine Type</Label>
                    <div className="font-medium">{1}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Zone</Label>
                    <div className="font-medium">{vm.region}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Operating System</Label>
                    <div className="font-medium">{vm.VMConfig.os}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">IP Address</Label>
                    <div className="font-mono text-sm flex items-center space-x-2">
                      <span>{vm.ipAddress}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(vm.ipAddress)}
                        className="h-6 w-6 p-0 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Time</Label>
                    <div className="font-mono text-sm">{(formatter.format(new Date(vm.endTime)))}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hardware Specs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Hardware Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-xl mb-3 mx-auto">
                      <Cpu className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{getVmDetails(vm.VMConfig.machineType).cpu}</div>
                    <div className="text-sm text-muted-foreground">vCPUs</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl mb-3 mx-auto">
                      <MemoryStick className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{getVmDetails(vm.VMConfig.machineType).ram} GB</div>
                    <div className="text-sm text-muted-foreground">Ram</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-3 mx-auto">
                      <HardDrive className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{vm.VMConfig.diskSize} GB</div>
                    <div className="text-sm text-muted-foreground">Disk Storage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SSH Access */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5" />
                    <span>SSH Access</span>
                  </CardTitle>
                  <CardDescription>
                    Connect to your instance using SSH
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>SSH Commands</Label>
                    </div>

                    <div className="flex items-center space-x-2 justify-between bg-black rounded-lg mb-2">
                      <div className="text-green-400 p-3 rounded font-mono text-sm">
                        ssh-keygen -R {vm.ipAddress}
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                        className="cursor-pointer"
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`ssh-keygen -R ${vm.ipAddress}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 justify-between bg-black rounded-lg mb-2">
                      <div className="text-green-400 p-3 rounded font-mono text-sm">
                        chmod 600 {vm.name}-key.pem
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                        className="cursor-pointer"
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`chmod 600 ${vm.name}-key.pem`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 justify-between bg-black rounded-lg">
                      <div className="text-green-400 p-3 rounded font-mono text-sm">
                        ssh -i {vm.name}-key.pem decloud@{vm.ipAddress}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                        className="cursor-pointer"
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`ssh -i ${vm.name}-key.pem decloud@${vm.ipAddress}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>


                  </div>
                </CardContent>
              </Card>
            </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start cursor-pointer"
                onClick={() => copyToClipboard(vm.ipAddress)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy IP Address
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start cursor-pointer"
                onClick={() => window.open(`/ssh/${vm.instanceId}`, '_blank')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                    Open in Browser
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}